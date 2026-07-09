/* =========================================================
   *  Mirror · 核心分析引擎
   *  - 九型人格测试与分析
   *  - 情绪识别、认知模式、心理动力线索
   *  - 5 模块结构化输出（基于人格类型）
   *  - 高风险内容识别 → 安全提醒
   *  - 成长周报
   *  - 情绪趋势
   * ========================================================= */

(function () {
  'use strict';

  /* ---------- 工具 ---------- */
  function $(sel) { return document.querySelector(sel); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function friendlyDate() {
    const d = new Date();
    return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
  }
  function countMatches(text, words) {
    if (!text) return 0;
    let n = 0;
    for (const w of words) {
      const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const m = text.match(re);
      if (m) n += m.length;
    }
    return n;
  }

  /* =========================================================
   *  九型人格核心数据（基于 Riso-Hudson 体系）
   *  包含：核心动机、核心恐惧、整合方向、解离方向、健康层级、盲点
   * ========================================================= */
  const ENNEAGRAM_TYPES = {
    1: {
      name: '完美型',
      nameEn: 'The Reformer',
      wing: '1w9 / 1w2',
      coreMotivation: '我必须做正确的事，才能被接纳',
      coreFear: '做错事、不完美、失控',
      integrationDirection: 7,
      dissociationDirection: 4,
      integrationName: '活跃型',
      dissociationName: '独特型',
      keywords: ['应该', '必须', '对错', '完美', '纠正', '批评', '标准', '规则', '公正', '正义', '原则', '严谨', '挑剔', '自责', '不满', '改进'],
      blindSpot: '常常忽略自己的真实感受，用「应该」代替「想要」。对自己和他人都很苛刻，难以接受不完美。',
      growthDirection: '学习接纳自己和他人的不完美，允许自己偶尔「犯错」。从「必须正确」走向「可以体验」。',
      stressPattern: '压力大时会变得更加挑剔、易怒，对自己和他人的标准更高，容易陷入自我批评。',
      healthyTraits: '正直、有原则、自律、善于改善、有责任感',
      unhealthyTraits: '苛刻、僵化、自我批评、自以为是、缺乏弹性',
      affirmation: '我不必事事完美，我的价值不在于做对了多少事。',
      bodyCenter: '腹中心（gut）',
      emotionFocus: ['愤怒', '焦虑'],
      advice: [
        '当你又在想「我应该……」时，停下来问自己：「我真正想要的是什么？」',
        '每天给自己一个「允许」——允许一件小事做得不那么完美。',
        '学习说「我不知道」和「我需要帮助」，这不是软弱，是真实。'
      ],
      reflectionQuestions: [
        '今天我对自己说的「应该」中，哪些是别人加给我的标准？',
        '如果一件事做得「不够好」，但完成了，它有价值吗？',
        '我今天有没有放过自己一次？'
      ]
    },
    2: {
      name: '助人型',
      nameEn: 'The Helper',
      wing: '2w1 / 2w3',
      coreMotivation: '我必须被需要，才能证明我的价值',
      coreFear: '不被需要、被拒绝、孤独',
      integrationDirection: 4,
      dissociationDirection: 8,
      integrationName: '独特型',
      dissociationName: '领袖型',
      keywords: ['帮', '照顾', '关心', '别人', '需求', '委屈', '讨好', '付出', '牺牲', '爱', '温暖', '体贴', '赞美', '认可', '重要'],
      blindSpot: '常常忽略自己的需求，把别人的感受放在第一位。很难直接表达自己的需要，害怕成为负担。',
      growthDirection: '学习关注自己的需求，从「我必须被需要」走向「我本身就有价值」。练习直接表达需要。',
      stressPattern: '压力大时会变得过度付出，然后感到委屈和怨恨，觉得自己的付出不被看见。',
      healthyTraits: '温暖、体贴、慷慨、有同理心、善于建立关系',
      unhealthyTraits: '过度依赖、操控、自我牺牲、受害者心态、难以拒绝',
      affirmation: '我的价值不需要通过帮助别人来证明，我本身就值得被爱。',
      bodyCenter: '心中心（heart）',
      emotionFocus: ['委屈', '失落', '不被理解'],
      advice: [
        '今天对一件你本会答应的事，先说「让我想一想」。不必立刻拒绝，只是先不自动同意。',
        '写下今天你自己的一个需求，然后试着用一句话说出来。',
        '接受别人的帮助，也是一种能力。今天试着让别人为你做一件小事。'
      ],
      reflectionQuestions: [
        '今天我在谁面前，没有做真实的自己？',
        '如果我不为任何人付出，我还剩下什么？',
        '我今天有没有对自己温柔一点？'
      ]
    },
    3: {
      name: '成就型',
      nameEn: 'The Achiever',
      wing: '3w2 / 3w4',
      coreMotivation: '我必须成功，才能被认可',
      coreFear: '失败、不被认可、默默无闻',
      integrationDirection: 6,
      dissociationDirection: 9,
      integrationName: '忠诚型',
      dissociationName: '和平型',
      keywords: ['成功', '目标', '效率', '优秀', '表现', '形象', '结果', '竞争', '比较', '进步', '证明', '价值', '重要', '厉害', '努力'],
      blindSpot: '常常把「做了什么」等同于「我是谁」。很难停下来感受自己的情绪，害怕被看到脆弱的一面。',
      growthDirection: '学习关注过程而非结果，从「我必须成功」走向「我本身就足够」。练习停下来感受当下。',
      stressPattern: '压力大时会更加追求效率和结果，忽略健康和关系，容易感到空虚和焦虑。',
      healthyTraits: '有动力、自信、有魅力、善于实现目标、适应力强',
      unhealthyTraits: '虚荣、肤浅、工作狂、操纵他人、害怕失败',
      affirmation: '我的价值不在于我的成就，我本身就值得被认可。',
      bodyCenter: '心中心（heart）',
      emotionFocus: ['焦虑', '羞耻', '无力感'],
      advice: [
        '今天至少做一件小事，并在心里对自己承认：「我做到了。」不必让别人知道。',
        '做一件没有目的的事——只是因为喜欢。',
        '允许自己休息，休息不是浪费时间，是充电。'
      ],
      reflectionQuestions: [
        '如果没有人关注我的成就，我是谁？',
        '我今天做的事情中，哪些是为了自己，哪些是为了证明给别人看？',
        '我真正想要的是什么，而不是别人期待我想要的？'
      ]
    },
    4: {
      name: '独特型',
      nameEn: 'The Individualist',
      wing: '4w3 / 4w5',
      coreMotivation: '我必须与众不同，才能找到意义',
      coreFear: '平庸、被抛弃、找不到自我',
      integrationDirection: 1,
      dissociationDirection: 2,
      integrationName: '完美型',
      dissociationName: '助人型',
      keywords: ['独特', '特别', '与众不同', '感受', '情绪', '意义', '美好', '深刻', '孤独', '忧郁', '灵感', '艺术', '自我', '真实', '缺失'],
      blindSpot: '常常放大自己的独特性，用痛苦来证明自己的深刻。难以接受平凡，容易陷入情绪波动。',
      growthDirection: '学习在平凡中发现美，从「我必须独特」走向「我本来就独特」。练习稳定情绪。',
      stressPattern: '压力大时会陷入情绪低谷，觉得自己不被理解，容易自我封闭和抑郁。',
      healthyTraits: '有深度、富有创造力、敏感、真诚、善于自省',
      unhealthyTraits: '情绪化、自我中心、悲观、嫉妒、难以相处',
      affirmation: '平凡不是缺陷，我的独特性不需要通过痛苦来证明。',
      bodyCenter: '心中心（heart）',
      emotionFocus: ['委屈', '失落', '羞耻'],
      advice: [
        '今天做一件「平凡」的事，并试着享受它——比如好好吃一顿饭、散步、整理房间。',
        '把当下最强烈的那个感受用一个词写下来，例如「委屈」「愤怒」——命名它，是把它松开的第一步。',
        '寻找一个平凡但美好的瞬间，把它记下来。'
      ],
      reflectionQuestions: [
        '我是否在用「与众不同」来逃避某些真实的感受？',
        '如果我和别人一样，我还值得被爱吗？',
        '今天的我，除了独特，还有什么？'
      ]
    },
    5: {
      name: '思考型',
      nameEn: 'The Investigator',
      wing: '5w4 / 5w6',
      coreMotivation: '我必须了解一切，才能感到安全',
      coreFear: '无知、被侵犯、资源不足',
      integrationDirection: 8,
      dissociationDirection: 7,
      integrationName: '领袖型',
      dissociationName: '活跃型',
      keywords: ['思考', '分析', '知识', '理解', '独立', '安静', '观察', '理性', '逻辑', '信息', '研究', '独处', '空间', '边界', '安全'],
      blindSpot: '常常躲在知识后面，用思考代替感受。害怕与人亲近，难以表达情感，容易变得冷漠。',
      growthDirection: '学习体验而非仅仅思考，从「我必须知道」走向「我可以体验」。练习与人连接。',
      stressPattern: '压力大时会更加退缩和孤立，过度分析问题，难以做出决策。',
      healthyTraits: '智慧、客观、独立、观察力强、有深度',
      unhealthyTraits: '孤僻、冷漠、吝啬、偏执、逃避现实',
      affirmation: '我不需要知道所有答案才能安全，与人连接不是威胁。',
      bodyCenter: '脑中心（head）',
      emotionFocus: ['焦虑', '无力感', '冲突感'],
      advice: [
        '今天至少和一个人分享你的一个想法或感受，而不是只在脑子里想。',
        '做一个身体动作：把手放在胸口，呼吸三次。感受身体的存在。',
        '允许自己「不知道」——不是所有问题都需要立刻找到答案。'
      ],
      reflectionQuestions: [
        '我今天有没有把「思考」当作逃避感受的方式？',
        '如果我承认自己的脆弱，会发生什么？',
        '我真正害怕的，是无知，还是被看见？'
      ]
    },
    6: {
      name: '忠诚型',
      nameEn: 'The Loyalist',
      wing: '6w5 / 6w7',
      coreMotivation: '我必须找到安全和信任，才能安心',
      coreFear: '不安全、被背叛、不确定',
      integrationDirection: 9,
      dissociationDirection: 3,
      integrationName: '和平型',
      dissociationName: '成就型',
      keywords: ['信任', '安全', '可靠', '怀疑', '担心', '害怕', '准备', '谨慎', '忠诚', '承诺', '责任', '焦虑', '犹豫', '风险', '保障'],
      blindSpot: '常常被焦虑驱动，用怀疑来保护自己。害怕做决定，难以信任自己的判断，容易犹豫不决。',
      growthDirection: '学习信任自己，从「我必须找到安全」走向「我就是安全」。练习做出决定。',
      stressPattern: '压力大时会变得更加焦虑和怀疑，过度准备或逃避责任，容易陷入恐慌。',
      healthyTraits: '忠诚、可靠、有责任感、谨慎、善于合作',
      unhealthyTraits: '焦虑、多疑、固执、拖延、恐惧承诺',
      affirmation: '我可以信任自己的判断，不确定也是生命的一部分。',
      bodyCenter: '脑中心（head）',
      emotionFocus: ['焦虑', '羞耻', '愤怒'],
      advice: [
        '选一件你在犹豫的事，做一个决定——哪怕是一个小决定。完成后告诉自己：「我做到了。」',
        '对一个反复在想的问题，设一个「思考截止时间」：晚上 9 点前还没答，就把它放进明天的抽屉。',
        '练习说「我相信」——相信自己的感觉，相信事情会有转机。'
      ],
      reflectionQuestions: [
        '我今天的担心，有多少是真实的风险，有多少是被过去的经验放大的？',
        '如果我不再害怕，我会做什么？',
        '我是否在用「谨慎」来逃避成长的机会？'
      ]
    },
    7: {
      name: '活跃型',
      nameEn: 'The Enthusiast',
      wing: '7w6 / 7w8',
      coreMotivation: '我必须保持快乐和自由，才能避免痛苦',
      coreFear: '痛苦、限制、被束缚',
      integrationDirection: 5,
      dissociationDirection: 1,
      integrationName: '思考型',
      dissociationName: '完美型',
      keywords: ['快乐', '自由', '有趣', '体验', '计划', '未来', '可能性', '逃避', '忙', '乐观', '好奇', '冒险', '选择', '多样', '新鲜'],
      blindSpot: '常常逃避痛苦和困难，用忙碌和快乐来掩盖不安。难以深入一件事，容易虎头蛇尾。',
      growthDirection: '学习面对痛苦而非逃避，从「我必须快乐」走向「我可以感受一切」。练习专注和坚持。',
      stressPattern: '压力大时会变得更加忙碌和逃避，难以停下来，容易感到空虚和焦虑。',
      healthyTraits: '乐观、富有创造力、热情、善于探索、精力充沛',
      unhealthyTraits: '逃避现实、不负责任、过度承诺、浅薄、害怕痛苦',
      affirmation: '痛苦不是敌人，面对它才能真正自由。',
      bodyCenter: '脑中心（head）',
      emotionFocus: ['焦虑', '冲突感', '无力感'],
      advice: [
        '选一件你一直想做但没做完的事，今天只做 10 分钟——不需要做完，只要开始。',
        '当你又想逃避时，停下来问自己：「我现在在逃避什么感受？」',
        '练习专注——做一件事时，放下手机，只关注这件事。'
      ],
      reflectionQuestions: [
        '我今天的快乐，有多少是真实的，有多少是在掩盖不安？',
        '如果我允许自己感受痛苦，它会把我怎么样？',
        '我是否在用「忙碌」来避免面对真正重要的事？'
      ]
    },
    8: {
      name: '领袖型',
      nameEn: 'The Challenger',
      wing: '8w7 / 8w9',
      coreMotivation: '我必须强大和掌控，才能避免被伤害',
      coreFear: '脆弱、被控制、被伤害',
      integrationDirection: 2,
      dissociationDirection: 5,
      integrationName: '助人型',
      dissociationName: '思考型',
      keywords: ['强大', '掌控', '保护', '直接', '勇气', '正义', '挑战', '对抗', '领导', '力量', '独立', '自主', '保护', '真实', '边界'],
      blindSpot: '常常把脆弱当作弱点，用强硬来保护自己。难以接受帮助，害怕依赖他人，容易变得攻击性。',
      growthDirection: '学习柔软而非强硬，从「我必须强大」走向「我本身就有力量」。练习接受帮助和示弱。',
      stressPattern: '压力大时会变得更加强硬和对抗，难以妥协，容易与人冲突。',
      healthyTraits: '勇敢、正直、有领导力、保护他人、独立自主',
      unhealthyTraits: '攻击性、控制欲强、自以为是、拒绝脆弱、难以相处',
      affirmation: '柔软不是软弱，真正的力量在于敢于脆弱。',
      bodyCenter: '腹中心（gut）',
      emotionFocus: ['愤怒', '焦虑', '无力感'],
      advice: [
        '今天试着向一个信任的人承认一件你感到脆弱的事。这不是示弱，是真实。',
        '当你又想控制局面时，停下来问自己：「我真正害怕失去的是什么？」',
        '练习说「我不知道」和「我需要帮助」。'
      ],
      reflectionQuestions: [
        '我是否在用「强大」来掩盖自己的脆弱？',
        '如果我不再控制一切，会发生什么？',
        '我真正需要被保护的，是什么？'
      ]
    },
    9: {
      name: '和平型',
      nameEn: 'The Peacemaker',
      wing: '9w8 / 9w1',
      coreMotivation: '我必须保持和平，才能被接纳',
      coreFear: '冲突、被分离、失去连接',
      integrationDirection: 3,
      dissociationDirection: 6,
      integrationName: '成就型',
      dissociationName: '忠诚型',
      keywords: ['和平', '和谐', '一致', '避免', '妥协', '舒服', '习惯', '拖延', '忘记', '陪伴', '理解', '包容', '平静', '满足', '融合'],
      blindSpot: '常常忽略自己的需求和意见，用妥协来维持和平。害怕冲突，难以表达自己的立场，容易变得拖延和麻木。',
      growthDirection: '学习表达自己的立场，从「我必须和平」走向「我本身就是和平」。练习说「不」。',
      stressPattern: '压力大时会变得更加拖延和麻木，难以做出决定，容易感到疲惫和失去方向。',
      healthyTraits: '温和、包容、有耐心、善于调解、内心平静',
      unhealthyTraits: '拖延、麻木、被动、难以表达立场、逃避冲突',
      affirmation: '我的立场不会破坏和平，真正的和谐来自真实表达。',
      bodyCenter: '腹中心（gut）',
      emotionFocus: ['冲突感', '无力感', '委屈'],
      advice: [
        '今天对一件你本会妥协的事，试着说「我想……」或「我不同意」。',
        '写下今天你自己的一个想法或感受，然后试着表达出来。',
        '练习关注自己——每天给自己 5 分钟，只做自己想做的事。'
      ],
      reflectionQuestions: [
        '今天我在什么情况下，把别人的意见放在了自己前面？',
        '如果我表达了自己的立场，关系会破裂吗？',
        '我是否在用「和平」来逃避成长？'
      ]
    }
  };

  /* =========================================================
   *  九型人格测试题（基于 Riso-Hudson RHETI 量表，强迫选择配对格式）
   *  每题呈现两个陈述，用户必须二选一，共 72 题（每型 8 题）
   *  这种格式比 Likert 量表更能测出无意识偏好
   * ========================================================= */
  const ENNEAGRAM_QUESTIONS = [
    // Type 1 vs 其他类型
    { key: 'q1', options: [{ type: 1, text: '我更倾向于指出问题并寻求改进，即使这可能让别人不舒服' }, { type: 9, text: '我更倾向于保持和谐，避免冲突' }] },
    { key: 'q2', options: [{ type: 1, text: '我经常觉得自己「应该」做得更好，容易自我批评' }, { type: 7, text: '我更喜欢关注积极的可能性，不太愿意自我批评' }] },
    { key: 'q3', options: [{ type: 1, text: '我对自己和他人有很高的标准，难以接受不完美' }, { type: 4, text: '我更关注独特性，对完美没有特别的执念' }] },
    { key: 'q4', options: [{ type: 1, text: '我倾向于按规则和原则行事' }, { type: 5, text: '我倾向于按自己的思考和分析行事' }] },
    // Type 2 vs 其他类型
    { key: 'q5', options: [{ type: 2, text: '我很在意别人的感受，常常把别人的需求放在自己前面' }, { type: 8, text: '我更关注自己的立场和边界，不太在意别人的感受' }] },
    { key: 'q6', options: [{ type: 2, text: '被需要的感觉让我觉得自己有价值' }, { type: 5, text: '独立和自给自足让我觉得安全' }] },
    { key: 'q7', options: [{ type: 2, text: '我很难直接表达自己的需求，害怕成为别人的负担' }, { type: 3, text: '我会直接表达自己的目标和需求，争取想要的东西' }] },
    { key: 'q8', options: [{ type: 2, text: '我喜欢帮助别人，从中获得满足感' }, { type: 9, text: '我更喜欢保持平静，不太主动去帮助别人' }] },
    // Type 3 vs 其他类型
    { key: 'q9', options: [{ type: 3, text: '我很在意自己的形象和表现，希望被别人认可' }, { type: 6, text: '我更在意安全和信任，不太关注形象' }] },
    { key: 'q10', options: [{ type: 3, text: '成功的感觉让我感到满足' }, { type: 4, text: '深刻的体验和意义让我感到满足' }] },
    { key: 'q11', options: [{ type: 3, text: '我常常把「做了什么」等同于「我是谁」' }, { type: 5, text: '我更关注自己的思考和知识，而非外在成就' }] },
    { key: 'q12', options: [{ type: 3, text: '我喜欢设定目标并努力实现' }, { type: 7, text: '我喜欢探索各种可能性，不太执着于单一目标' }] },
    // Type 4 vs 其他类型
    { key: 'q13', options: [{ type: 4, text: '我喜欢追求独特和与众不同，讨厌平庸' }, { type: 1, text: '我更关注正确性和改进，不太在意独特性' }] },
    { key: 'q14', options: [{ type: 4, text: '我对自己的感受很敏感，容易陷入情绪波动' }, { type: 5, text: '我更倾向于用理性控制情绪，保持冷静' }] },
    { key: 'q15', options: [{ type: 4, text: '我常常觉得自己和别人不一样，有时会感到孤独' }, { type: 2, text: '我更喜欢融入人群，和别人保持连接' }] },
    { key: 'q16', options: [{ type: 4, text: '我很在意事物的意义和美感' }, { type: 8, text: '我更在意事物的真实和力量' }] },
    // Type 5 vs 其他类型
    { key: 'q17', options: [{ type: 5, text: '我喜欢独立思考和学习，知识让我感到安全' }, { type: 2, text: '我更喜欢与人连接，被需要让我感到安全' }] },
    { key: 'q18', options: [{ type: 5, text: '我需要很多个人空间，不喜欢被人打扰' }, { type: 7, text: '我喜欢社交和活动，不太需要独处' }] },
    { key: 'q19', options: [{ type: 5, text: '我倾向于用理性分析来处理问题，而不是凭感觉' }, { type: 4, text: '我更倾向于凭直觉和感受来做决定' }] },
    { key: 'q20', options: [{ type: 5, text: '我喜欢收集信息，为未来做准备' }, { type: 3, text: '我喜欢立即行动，追求结果' }] },
    // Type 6 vs 其他类型
    { key: 'q21', options: [{ type: 6, text: '我常常感到焦虑和担心，需要确定和安全感' }, { type: 9, text: '我更容易放松和平静，不太容易焦虑' }] },
    { key: 'q22', options: [{ type: 6, text: '我很重视信任和忠诚，难以轻易相信别人' }, { type: 8, text: '我更相信自己的力量，不太依赖信任' }] },
    { key: 'q23', options: [{ type: 6, text: '我做决定时常常犹豫不决，害怕做出错误的选择' }, { type: 3, text: '我做决定很果断，相信自己的判断' }] },
    { key: 'q24', options: [{ type: 6, text: '我喜欢有计划和准备，避免意外' }, { type: 7, text: '我喜欢即兴和灵活，享受变化' }] },
    // Type 7 vs 其他类型
    { key: 'q25', options: [{ type: 7, text: '我喜欢尝试新事物，讨厌无聊和限制' }, { type: 9, text: '我更喜欢稳定和熟悉，不太喜欢变化' }] },
    { key: 'q26', options: [{ type: 7, text: '我倾向于逃避痛苦和困难，保持积极乐观' }, { type: 4, text: '我愿意面对痛苦和深度，从中寻找意义' }] },
    { key: 'q27', options: [{ type: 7, text: '我有很多兴趣和计划，但常常难以坚持到底' }, { type: 1, text: '我喜欢把事情做完做好，坚持到底' }] },
    { key: 'q28', options: [{ type: 7, text: '我喜欢展望未来的可能性' }, { type: 5, text: '我喜欢分析过去和现在的事实' }] },
    // Type 8 vs 其他类型
    { key: 'q29', options: [{ type: 8, text: '我喜欢掌控局面，讨厌被控制或被欺负' }, { type: 6, text: '我更喜欢合作和信任，不太想掌控一切' }] },
    { key: 'q30', options: [{ type: 8, text: '我很直接和勇敢，愿意为自己和他人站出来' }, { type: 2, text: '我更倾向于温和和体贴，避免冲突' }] },
    { key: 'q31', options: [{ type: 8, text: '我难以接受脆弱，认为软弱是一种缺陷' }, { type: 4, text: '我认为脆弱是真实和深刻的表现' }] },
    { key: 'q32', options: [{ type: 8, text: '我喜欢挑战权威，维护正义' }, { type: 1, text: '我喜欢维护规则和秩序，促进公平' }] },
    // Type 9 vs 其他类型
    { key: 'q33', options: [{ type: 9, text: '我喜欢保持和平与和谐，讨厌冲突和争吵' }, { type: 8, text: '我不害怕冲突，有时甚至欢迎冲突' }] },
    { key: 'q34', options: [{ type: 9, text: '我常常妥协和让步，避免表达不同意见' }, { type: 3, text: '我会坚持自己的立场，争取想要的东西' }] },
    { key: 'q35', options: [{ type: 9, text: '我有时会拖延，难以做出决定' }, { type: 1, text: '我喜欢及时做出决定，追求效率' }] },
    { key: 'q36', options: [{ type: 9, text: '我更喜欢随遇而安，不太追求目标' }, { type: 3, text: '我喜欢设定目标并努力实现' }] },
    // 第二组配对题
    { key: 'q37', options: [{ type: 1, text: '我倾向于用「应该」来指导自己的行为' }, { type: 2, text: '我倾向于用「需要」来指导自己的行为' }] },
    { key: 'q38', options: [{ type: 2, text: '我常常忽略自己的需求，先满足别人' }, { type: 5, text: '我常常保护自己的资源，先满足自己' }] },
    { key: 'q39', options: [{ type: 3, text: '我擅长在人前表现自己最好的一面' }, { type: 4, text: '我更喜欢展现真实的自己，包括不完美的一面' }] },
    { key: 'q40', options: [{ type: 4, text: '我常常感到自己缺少什么，不完整' }, { type: 1, text: '我常常感到自己需要改进，变得更好' }] },
    { key: 'q41', options: [{ type: 5, text: '我倾向于从世界中抽离，保持观察' }, { type: 8, text: '我倾向于投入世界，主动参与' }] },
    { key: 'q42', options: [{ type: 6, text: '我常常怀疑自己和他人的动机' }, { type: 9, text: '我常常相信别人是善意的，愿意信任' }] },
    { key: 'q43', options: [{ type: 7, text: '我喜欢保持多种选择，避免承诺' }, { type: 6, text: '我喜欢做出承诺，获得安全感' }] },
    { key: 'q44', options: [{ type: 8, text: '我倾向于直接表达，不绕圈子' }, { type: 2, text: '我倾向于委婉表达，照顾别人感受' }] },
    { key: 'q45', options: [{ type: 9, text: '我常常忘记自己的意见，认同别人' }, { type: 4, text: '我常常坚持自己的独特性，不愿妥协' }] },
    { key: 'q46', options: [{ type: 1, text: '我重视公正和原则超过个人关系' }, { type: 6, text: '我重视忠诚和关系超过个人原则' }] },
    { key: 'q47', options: [{ type: 2, text: '我通过帮助别人来定义自己' }, { type: 3, text: '我通过成就来定义自己' }] },
    { key: 'q48', options: [{ type: 3, text: '我害怕失败和默默无闻' }, { type: 5, text: '我害怕无知和被侵犯' }] },
    { key: 'q49', options: [{ type: 4, text: '我害怕平庸和不被理解' }, { type: 7, text: '我害怕痛苦和限制' }] },
    { key: 'q50', options: [{ type: 5, text: '我害怕依赖和失去独立' }, { type: 8, text: '我害怕脆弱和被控制' }] },
    { key: 'q51', options: [{ type: 6, text: '我害怕不确定和被背叛' }, { type: 9, text: '我害怕冲突和被分离' }] },
    { key: 'q52', options: [{ type: 7, text: '我害怕无聊和错过机会' }, { type: 1, text: '我害怕犯错和失控' }] },
    { key: 'q53', options: [{ type: 8, text: '我害怕软弱和被伤害' }, { type: 2, text: '我害怕不被需要和孤独' }] },
    { key: 'q54', options: [{ type: 9, text: '我害怕失去和平和连接' }, { type: 3, text: '我害怕失去认可和地位' }] },
    // 第三组配对题
    { key: 'q55', options: [{ type: 1, text: '我倾向于批评来推动改进' }, { type: 9, text: '我倾向于包容来维持和谐' }] },
    { key: 'q56', options: [{ type: 2, text: '我倾向于通过给予来获得爱' }, { type: 4, text: '我倾向于通过独特来获得爱' }] },
    { key: 'q57', options: [{ type: 3, text: '我倾向于通过表现来获得认可' }, { type: 5, text: '我倾向于通过知识来获得尊重' }] },
    { key: 'q58', options: [{ type: 4, text: '我倾向于通过情感深度来获得理解' }, { type: 7, text: '我倾向于通过快乐来获得连接' }] },
    { key: 'q59', options: [{ type: 5, text: '我倾向于通过独立来获得安全' }, { type: 6, text: '我倾向于通过信任来获得安全' }] },
    { key: 'q60', options: [{ type: 6, text: '我倾向于通过准备来获得安心' }, { type: 8, text: '我倾向于通过力量来获得安心' }] },
    { key: 'q61', options: [{ type: 7, text: '我倾向于通过逃避来避免痛苦' }, { type: 1, text: '我倾向于通过面对来解决问题' }] },
    { key: 'q62', options: [{ type: 8, text: '我倾向于通过掌控来避免伤害' }, { type: 9, text: '我倾向于通过妥协来避免冲突' }] },
    { key: 'q63', options: [{ type: 9, text: '我倾向于通过麻木来避免不安' }, { type: 3, text: '我倾向于通过行动来避免空虚' }] },
    { key: 'q64', options: [{ type: 1, text: '我在压力下变得更加挑剔和易怒' }, { type: 7, text: '我在压力下变得更加逃避和忙碌' }] },
    { key: 'q65', options: [{ type: 2, text: '我在压力下变得过度付出然后怨恨' }, { type: 8, text: '我在压力下变得强硬和对抗' }] },
    { key: 'q66', options: [{ type: 3, text: '我在压力下变得更加追求效率和结果' }, { type: 9, text: '我在压力下变得更加拖延和麻木' }] },
    { key: 'q67', options: [{ type: 4, text: '我在压力下变得情绪化和自我封闭' }, { type: 2, text: '我在压力下变得过度关注别人' }] },
    { key: 'q68', options: [{ type: 5, text: '我在压力下变得退缩和过度分析' }, { type: 7, text: '我在压力下变得冲动和分散' }] },
    { key: 'q69', options: [{ type: 6, text: '我在压力下变得焦虑和怀疑' }, { type: 3, text: '我在压力下变得过度行动' }] },
    { key: 'q70', options: [{ type: 7, text: '我在压力下变得逃避和肤浅' }, { type: 1, text: '我在压力下变得批评和僵化' }] },
    { key: 'q71', options: [{ type: 8, text: '我在压力下变得攻击性和控制' }, { type: 5, text: '我在压力下变得退缩和冷漠' }] },
    { key: 'q72', options: [{ type: 9, text: '我在压力下变得麻木和拖延' }, { type: 6, text: '我在压力下变得焦虑和犹豫' }] }
  ];

  /* =========================================================
   *  人格测试流程
   * ========================================================= */
  function getPersonality() { return localStorage.getItem('mirror_personality') || ''; }
  function setPersonality(type) { localStorage.setItem('mirror_personality', type); }
  function hasPersonality() { return !!localStorage.getItem('mirror_personality'); }

  function startPersonalityTest() {
    $('#tab-today').style.display = 'none';
    $('#tab-mirror').style.display = 'none';
    $('#tab-report').style.display = 'none';
    $('#tab-trend').style.display = 'none';
    $('#bottom-nav').style.display = 'none';
    
    const testPanel = document.createElement('section');
    testPanel.id = 'tab-test';
    testPanel.className = 'tab-panel active';
    testPanel.innerHTML = `
      <header class="top-bar">
        <div class="top-left">
          <div class="brand-mark">Mirror</div>
          <div class="top-date">九型人格测试</div>
        </div>
        <button class="theme-toggle" data-theme-switch><span class="theme-icon">☾</span><span>夜晚</span></button>
      </header>
      <div class="panel-scroll" style="max-width: 500px; margin: 0 auto;">
        <div class="section-title">✦ 了解你的底层代码</div>
        <div class="card-d">
          <p style="color:var(--ink-1);font-size:14px;line-height:1.8;margin-bottom:16px;">
            这个测试基于 Riso-Hudson 九型人格量表（RHETI），包含 72 道强迫选择题。<br>
            每题呈现两个陈述，请选择更符合你的那一个。没有对错之分。
          </p>
          <div class="test-progress">
            <span id="test-progress-text">0/72</span>
            <div class="progress-bar"><div class="progress-fill" id="progress-fill"></div></div>
          </div>
        </div>
        <div id="question-container" class="card-d" style="min-height: 200px;"></div>
        <div id="test-result" hidden>
          <div class="card-d">
            <h3 style="color:var(--ink-0);font-size:18px;margin-bottom:16px;text-align:center;">你的人格类型</h3>
            <div id="result-type" style="font-size:24px;text-align:center;color:var(--accent-strong);font-weight:500;"></div>
            <div id="result-subtype" style="font-size:13px;text-align:center;color:var(--ink-2);margin-top:4px;"></div>
            <div class="section-sub-title" style="margin-top:24px;">核心动机</div>
            <div id="result-motivation" style="color:var(--ink-1);font-size:14px;text-align:center;background:color-mix(in srgb, var(--accent) 15%, transparent);padding:12px;border-radius:10px;"></div>
            <div class="section-sub-title">核心恐惧</div>
            <div id="result-fear" style="color:var(--ink-1);font-size:14px;text-align:center;"></div>
            <div class="section-sub-title">成长方向</div>
            <div id="result-growth" style="color:var(--ink-1);font-size:14px;"></div>
            <button id="confirm-personality" class="primary-btn" style="width:100%;margin-top:24px;">确认这个类型</button>
            <button id="retake-test" class="ghost-btn" style="width:100%;margin-top:8px;">重新测试</button>
          </div>
        </div>
      </div>
    `;
    document.querySelector('.app').appendChild(testPanel);
    initTheme();
    renderQuestion(0, {});
  }

  let currentQuestionIndex = 0;
  let testAnswers = {};

  function renderQuestion(index, answers) {
    testAnswers = answers;
    if (index >= ENNEAGRAM_QUESTIONS.length) {
      showTestResult();
      return;
    }

    const q = ENNEAGRAM_QUESTIONS[index];
    const container = $('#question-container');
    const progress = Math.round(((index + 1) / ENNEAGRAM_QUESTIONS.length) * 100);
    
    $('#test-progress-text').textContent = (index + 1) + '/' + ENNEAGRAM_QUESTIONS.length;
    $('#progress-fill').style.width = progress + '%';

    container.innerHTML = `
      <div style="font-size:15px;color:var(--ink-0);line-height:1.8;margin-bottom:16px;">
        <span style="color:var(--accent-strong);font-size:12px;margin-right:8px;">Q${index + 1}</span>
        <span style="color:var(--ink-2);font-size:13px;">请选择更符合你的一项</span>
      </div>
      <div class="choice-pair">
        <button class="choice-btn" data-option="0">
          <span class="choice-label">A</span>
          <span class="choice-text">${escapeHtml(q.options[0].text)}</span>
        </button>
        <button class="choice-btn" data-option="1">
          <span class="choice-label">B</span>
          <span class="choice-text">${escapeHtml(q.options[1].text)}</span>
        </button>
      </div>
    `;

    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.onclick = () => {
        const optionIndex = parseInt(btn.dataset.option);
        const selectedType = q.options[optionIndex].type;
        answers[q.key] = { type: selectedType };
        renderQuestion(index + 1, answers);
      };
    });
  }

  function showTestResult() {
    const scores = {};
    for (let i = 1; i <= 9; i++) scores[i] = 0;
    
    for (const key in testAnswers) {
      const ans = testAnswers[key];
      scores[ans.type] += 1;
    }

    let topType = 1;
    let topScore = scores[1];
    let secondType = 2;
    let secondScore = scores[2];
    
    for (let i = 2; i <= 9; i++) {
      if (scores[i] > topScore) {
        secondType = topType;
        secondScore = topScore;
        topScore = scores[i];
        topType = i;
      } else if (scores[i] > secondScore) {
        secondScore = scores[i];
        secondType = i;
      }
    }

    const typeData = ENNEAGRAM_TYPES[topType];
    $('#question-container').hidden = true;
    $('#test-result').hidden = false;
    $('#result-type').textContent = typeData.name;
    $('#result-subtype').textContent = typeData.nameEn + ' · ' + typeData.wing;
    $('#result-motivation').textContent = typeData.coreMotivation;
    $('#result-fear').textContent = typeData.coreFear;
    $('#result-growth').textContent = typeData.growthDirection;

    $('#confirm-personality').onclick = () => {
      setPersonality(topType.toString());
      location.reload();
    };

    $('#retake-test').onclick = () => {
      currentQuestionIndex = 0;
      testAnswers = {};
      $('#test-result').hidden = true;
      $('#question-container').hidden = false;
      renderQuestion(0, {});
    };
  }

  function showPersonalitySelector() {
    document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
    $('#bottom-nav').style.display = 'none';
    $('#personality-btn').style.display = 'none';
    $('#personality-btn-mirror').style.display = 'none';

    const existingSelector = document.querySelector('#tab-selector');
    if (existingSelector) existingSelector.remove();

    const selectorPanel = document.createElement('section');
    selectorPanel.id = 'tab-selector';
    selectorPanel.className = 'tab-panel active';
    selectorPanel.innerHTML = `
      <header class="top-bar">
        <div class="top-left">
          <div class="brand-mark">Mirror</div>
          <div class="top-date">选择你的人格类型</div>
        </div>
        <button class="theme-toggle" data-theme-switch><span class="theme-icon">☾</span><span>夜晚</span></button>
      </header>
      <div class="panel-scroll" style="max-width: 500px; margin: 0 auto;">
        <div class="section-title">✦ 了解你的底层代码</div>
        <div class="card-d">
          <p style="color:var(--ink-1);font-size:14px;line-height:1.8;margin-bottom:16px;">
            九型人格是一种深层的自我认知工具，帮助你理解自己的核心动机和恐惧。<br>
            你可以选择直接选择，或通过测试来发现。
          </p>
          <button id="start-test-btn" class="primary-btn" style="width:100%;margin-bottom:12px;">开始测试（推荐）</button>
          <div class="section-sub-title">或直接选择</div>
          <div class="personality-grid" id="personality-grid"></div>
        </div>
      </div>
    `;
    document.querySelector('.app').appendChild(selectorPanel);
    initTheme();

    const grid = $('#personality-grid');
    for (let i = 1; i <= 9; i++) {
      const type = ENNEAGRAM_TYPES[i];
      const el = document.createElement('button');
      el.className = 'personality-item';
      el.innerHTML = `<span class="p-number">${i}</span><span class="p-name">${type.name}</span><span class="p-en">${type.nameEn}</span>`;
      el.onclick = () => {
        setPersonality(i.toString());
        location.reload();
      };
      grid.appendChild(el);
    }

    $('#start-test-btn').onclick = () => {
      document.querySelector('#tab-selector').remove();
      startPersonalityTest();
    };
  }

  /* =========================================================
   *  高风险内容识别
   * ========================================================= */
  const RISK_RULES = {
    suicide: {
      label: '严重绝望 / 自杀倾向',
      keywords: [
        '不想活', '不想活下去', '活着没意思', '活着没意义',
        '不如死了', '想自杀', '自杀', '结束自己', '结束生命',
        '离开这个世界', '一走了之', '轻生', '自绝', '想死掉',
        '真想死', '死了算了', '一了百了', '没什么好留恋',
        '割腕', '跳楼', '跳河', '上吊', '服毒',
        '每天都想', '每天都在想', '不再醒来'
      ],
      mild: ['活着好累', '没有意义', '没意思', '没希望', '绝望', '撑不下去']
    },
    self_harm: {
      label: '自伤倾向',
      keywords: ['自残', '自伤', '伤害自己', '打自己', '扇自己', '撞墙', '割自己', '烫自己', '咬自己']
    },
    domestic: {
      label: '家庭暴力 / 被控制',
      keywords: [
        '家暴', '被打', '被家暴', '被骂', '被侮辱', '被控制',
        '控制我', '被软禁', '不让出门', '不让我', '不许我',
        '被恐吓', '被威胁', '威胁我', '恐吓我',
        '冷暴力', '精神虐待', '被虐待', '被折磨',
        '扇耳光', '推我', '掐我', '打我',
        'PUA', '被 PUA'
      ]
    },
    danger: {
      label: '明确人身危险',
      keywords: ['想杀了', '想弄死', '报复社会', '同归于尽']
    }
  };

  function detectRisk(text) {
    const result = { type: null, score: 0, matches: [] };
    for (const key in RISK_RULES) {
      const rule = RISK_RULES[key];
      const n = countMatches(text, rule.keywords);
      if (n > 0) {
        result.type = result.type || key;
        result.score += n;
        result.matches.push(rule.label);
      }
    }
    if (result.score === 0) {
      // 轻微信号
      let mild = 0;
      if (RISK_RULES.suicide.mild) mild += countMatches(text, RISK_RULES.suicide.mild);
      if (mild >= 3) {
        result.type = 'mild';
        result.score = mild;
        result.matches.push('强烈无助感');
      }
    }
    return result;
  }

  /* =========================================================
   *  情绪词典
   * ========================================================= */
  const EMOTIONS = {
    anger: { label: '愤怒', words: ['生气', '愤怒', '气疯', '火大', '烦躁', '恼火', '炸了', '不爽', '不耐烦', '暴躁', '讨厌', '恨', '气死'] },
    sad: { label: '委屈 / 失落', words: ['委屈', '难过', '伤心', '心碎', '想哭', '哭了', '沮丧', '失落', '难受', '孤单', '孤独', '无助'] },
    anxious: { label: '焦虑 / 不安', words: ['焦虑', '紧张', '不安', '担心', '害怕', '忐忑', '慌乱', '压力大', '心累', '忧虑', '怕', '着急'] },
    shame: { label: '羞耻 / 尴尬', words: ['尴尬', '丢脸', '不好意思', '害羞', '羞愧', '丢人', '没面子', '难为情', '自卑', '不配', '不如人', '没用', '不够好'] },
    happy: { label: '平静 / 满足', words: ['开心', '温暖', '感动', '满足', '幸福', '平静', '安心', '踏实', '放松', '欣慰', '感激'] },
    conflict: { label: '冲突感 / 矛盾', words: ['纠结', '矛盾', '两难', '不知道怎么办', '不知道', '想不清', '混乱', '拿不定主意'] },
    misunderstood: { label: '不被理解', words: ['不理解', '不懂我', '不明白我', '没人', '没有人', '没人懂', '被误解', '误会'] },
    powerless: { label: '无力感', words: ['无能为力', '没办法', '做不到', '做不了', '没力气', '没精神', '不想动', '力不从心', '没办法'] }
  };

  function analyzeEmotions(text) {
    const res = [];
    for (const key in EMOTIONS) {
      const n = countMatches(text, EMOTIONS[key].words);
      if (n > 0) res.push({ key, label: EMOTIONS[key].label, count: n });
    }
    res.sort((a, b) => b.count - a.count);
    return res;
  }

  /* =========================================================
   *  认知模式词典
   *  每条都有解释 + 心理学名词（附说明）
   * ========================================================= */
  const PATTERNS = [
    {
      id: 'people_pleasing',
      label: '讨好倾向',
      emoji: '🌻',
      keywords: ['不敢拒绝', '拒绝不了', '怕得罪', '怕别人不高兴', '怕别人失望', '委屈自己', '勉强答应', '怕被讨厌', '怕被嫌弃', '还是答应'],
      pattern: '你倾向于把别人的感受放在自己前面，把关系的和谐放在比你自己的需求更重要的位置。',
      concept: '讨好型应对（people-pleasing）—— 在早期关系里学到：「只有让别人满意，我才值得被留下。」',
      trait: '讨好倾向'
    },
    {
      id: 'rejection_sensitive',
      label: '被否定敏感',
      emoji: '🫧',
      keywords: ['被质疑', '被否定', '被批评', '被指责', '挑错', '说我不好', '说我不行', '不认可', '不接受', '反驳我', '反对', '被骂', '被说', '被怼'],
      pattern: '别人的一句否定或质疑，在你心里被放得特别大——它不仅是事实，更像是对你这个人的审判。',
      concept: '被拒敏感（rejection sensitivity）—— 对他人可能的否定有过高预期，并把它与自我价值挂钩。',
      trait: '对否定敏感'
    },
    {
      id: 'conflict_avoidance',
      label: '逃避冲突',
      emoji: '🕊',
      keywords: ['没反驳', '没说话', '保持沉默', '忍了', '忍下来', '算了不说', '不想争吵', '不想吵架', '不想闹僵', '算了吧', '退一步', '让着他', '退让'],
      pattern: '在可能发生冲突的时刻，你先退一步——这曾是保护关系的方式，但现在可能让你失去表达。',
      concept: '冲突回避（conflict avoidance）—— 冲突在你心里关联着"被抛弃"的风险。',
      trait: '倾向逃避冲突'
    },
    {
      id: 'overthinking',
      label: '过度思虑',
      emoji: '🌀',
      keywords: ['反复想', '一直想', '想太多', '想来想去', '想来想去', '是不是我', '是不是他', '会不会', '到底', '为什么', '什么意思', '想不明白', '猜', '怀疑', '琢磨', '翻来覆去'],
      pattern: '你的头脑像一台不停摆的分析机，反复回放一句话、一个眼神。表面在思考，底层是对失控的恐惧。',
      concept: '思维反刍（rumination）—— 反复思考一个问题，而不采取行动，常与焦虑和拖延并存。',
      trait: '过度思虑'
    },
    {
      id: 'self_blame',
      label: '自我攻击',
      emoji: '🥀',
      keywords: ['我真没用', '我真蠢', '我不配', '我很差', '我不行', '我怎么', '我总是', '讨厌自己', '恨自己', '自己活该', '我有问题', '都怪我', '是我不好'],
      pattern: '你对内攻击的力量很强，对自己比对别人更苛刻。',
      concept: '自我苛责（self-criticism）—— 内在有一个严厉的批判者，通常是早年标准被内化后的结果。',
      trait: '习惯自我攻击'
    },
    {
      id: 'need_suppressed',
      label: '不表达需求',
      emoji: '🫂',
      keywords: ['不好意思说', '说不出口', '没好意思', '不方便说', '不知道怎么说', '没法说', '难以启齿', '开不了口', '没说出来', '没告诉他们'],
      pattern: '你心里有需求，但到了嘴边就被「不好意思」挡住——你怕自己的需求给别人添麻烦、或不值得被认真对待。',
      concept: '需求抑制（need suppression）—— 把自己的需求从关系中删掉，是对自己最温柔的背叛。',
      trait: '不善表达需求'
    },
    {
      id: 'attachment_anxious',
      label: '关系焦虑',
      emoji: '🌧',
      keywords: ['他是不是', '是不是不爱', '是不是烦', '不理我', '不回复', '不回消息', '冷淡', '疏远', '是不是不爱我了', '是不是讨厌我', '忽冷忽热', '他变了', '怕失去', '害怕失去'],
      pattern: '在关系里，你常从一条消息、一个眼神里读出被抛弃的信号——你的心在不断求证"我是否还重要"。',
      concept: '焦虑型依恋（anxious attachment）—— 把关系的微小变化与自我价值挂钩，需要通过反复确认来获得安全感。',
      trait: '关系中易过度解读与焦虑'
    },
    {
      id: 'procrastination',
      label: '拖延 / 回避决定',
      emoji: '⏳',
      keywords: ['拖', '拖着', '还没做', '迟迟', '没决定', '做不了决定', '犹豫不决', '犹豫', '再想想', '等到', '不想做', '没心情', '懒得', '拖延', '没动力'],
      pattern: '做决定或开始行动时你习惯先等等，这种"等"有时不是懒，而是怕做错——你用延迟来避免面对结果。',
      concept: '回避型拖延（avoidant procrastination）—— 拖延的底层是对失败或批评的恐惧，不做就不会被判定。',
      trait: '做决定时倾向拖延'
    },
    {
      id: 'should_statements',
      label: '被「应该」绑架',
      emoji: '📏',
      keywords: ['我应该', '应该要', '必须', '应该', '本应该', '应当', '要做', '一定要', '不能辜负', '得做好', '该做的'],
      pattern: '你对自己有许多「应该」。这些「应该」有时不是你真心想要的，而是别人或社会给你的脚本。',
      concept: '应该性思维（should-statement）—— 用僵化的规则苛责自己，不符合时就产生内疚与羞耻。',
      trait: '被"应该"绑架'
    },
    {
      id: 'emotional_suppression',
      label: '情绪压抑',
      emoji: '🌫',
      keywords: ['忍住', '憋住', '没哭', '没说', '藏在心里', '放在心里', '不想让人知道', '不想表现出来', '假装没事', '强颜欢笑', '装出来', '装没事'],
      pattern: '你习惯先把情绪压下去，让世界只看到你稳定的那一面。被压下去的情绪没有消失，会以别的方式回来。',
      concept: '情绪压抑（emotional suppression）—— 长期与感受断开，容易以疲惫、身体疼痛或无名烦躁的方式再出现。',
      trait: '情绪压抑倾向'
    }
  ];

  function analyzePatterns(text) {
    const res = [];
    for (const p of PATTERNS) {
      const n = countMatches(text, p.keywords);
      if (n > 0) res.push({ ...p, count: n });
    }
    res.sort((a, b) => b.count - a.count);
    return res;
  }

  /* =========================================================
   *  主题领域
   * ========================================================= */
  const THEMES = [
    { label: '职场 / 关系', words: ['同事', '领导', '老板', '开会', '会议', '项目', '汇报', '加班', '任务', '工作', '客户', '被安排', '被骂', '被质疑'] },
    { label: '亲密关系', words: ['男朋友', '女朋友', '对象', '老公', '老婆', '他', '她', '吵架', '分手', '约会', '感情', '恋爱', '在一起', '冷战'] },
    { label: '家庭', words: ['爸爸', '妈妈', '父母', '家里', '家人', '爸妈', '孩子', '兄弟姐妹', '婆婆', '公公', '丈母娘', '老丈人'] },
    { label: '朋友', words: ['朋友', '闺蜜', '好朋友', '聚餐', '同学', '聚会'] },
    { label: '自我管理', words: ['学习', '成长', '进步', '改变', '努力', '坚持', '目标', '计划', '自律', '没完成', '没做到'] },
    { label: '健康与精力', words: ['累', '睡', '失眠', '身体', '生病', '疲惫', '没精神', '休息', '放松', '没力气', '头疼', '不舒服'] },
    { label: '经济 / 未来', words: ['钱', '工资', '没钱', '买房', '租房', '未来', '前途', '迷茫', '压力', '还贷款', '房贷'] },
    { label: '自我价值', words: ['没用', '不配', '不好', '不行', '失败者', '我是多余的', '没价值', '不重要'] }
  ];

  function analyzeThemes(text) {
    const res = [];
    for (const t of THEMES) {
      const n = countMatches(text, t.words);
      if (n > 0) res.push({ label: t.label, count: n });
    }
    res.sort((a, b) => b.count - a.count);
    return res;
  }

  /* =========================================================
   *  5 个预设「我想成为的人」
   * ========================================================= */
  const DESIRE_PRESETS = [
    '情绪稳定的人',
    '自信的人',
    '自律的人',
    '更有行动力的人',
    '更清醒地爱与被爱的人'
  ];

  // 每个方向对应的具体行动建议模板
  const DESIRE_ACTION_ADVICE = {
    '情绪稳定的人': [
      '在情绪升起的 3 分钟内，先不回应任何人——不是冷处理，而是给自己一个缓冲空间。',
      '对自己说一句：「情绪是真实的，但它不等于事实。」',
      '把当下最强烈的那个感受用一个词写下来，例如「委屈」「愤怒」——命名它，是把它松开的第一步。'
    ],
    '自信的人': [
      '今天至少做一件小事，并在心里对自己承认：「我做到了。」不必让别人知道。',
      '遇到别人的质疑时，先不急着自我辩护——试试说：「我理解你会这么想，我目前的判断是……」',
      '睡前写下一件今天做得不错的事，哪怕再小。自信是被一件件事喂养出来的。'
    ],
    '自律的人': [
      '不是"我要自律"，而是"我现在先做 10 分钟"——把宏大目标压成一个可以立刻开始的动作。',
      '每天固定一个时间做一件小练习，例如起床后喝一杯水、睡前读 5 页书——它是你给新习惯的锚点。',
      '一天没做到时，对自己说：「这是一个信息，不是审判。」——自律的人不是从不错过，而是从不放弃。'
    ],
    '更有行动力的人': [
      '把一件你在拖延的事，拆成「第一步」——只是第一步，不需要第二步。然后去做它。',
      '在今天结束之前，至少对一个你一直说「再说」的请求做出明确答复（哪怕是拒绝）。',
      '别等「有感觉了」再开始。行动会带来感觉，而不是反过来。'
    ],
    '更清醒地爱与被爱的人': [
      '下次和伴侣对话时，如果又回到反复纠结"他/她是不是爱我"，把问题换成：「我现在想要的是什么？」',
      '把你认为关系里最珍贵的东西写下来（例如被倾听、被接住），然后想一个方式去给——你想要什么，就去练习给出什么。',
      '一段让你不断自我怀疑的关系，不是你"不够好"的证据，而是它本身可能已经超出了你的负荷。'
    ]
  };

  // 通用建议（当用户自定义目标时）
  const GENERIC_ACTION_ADVICE = [
    '把你想成为的这个人，压缩成一句「第一动作」—— 如果他/她在，现在会做什么？',
    '每天挑 10 分钟去做那件你一直没做的事——不必做完，只要开始。',
    '别问「我能做到吗」，问「我愿意试吗」。试，就已经够了。'
  ];

  /* =========================================================
   *  承接情绪 + 5 模块结构化回应（基于九型人格）
   * ========================================================= */

  // 第 0 段：情绪承接（echo）—— 结合人格类型
  function buildEcho(text, emotions, personality) {
    const typeData = personality ? ENNEAGRAM_TYPES[personality] : null;
    const top = emotions[0];
    const hasStrong = top && top.count >= 1;

    const variants = [];
    if (typeData) {
      if (hasStrong) {
        variants.push('作为「' + typeData.name + '」，你今天带着「' + top.label + '」在走。这种感受对你来说，可能和你的「' + typeData.coreMotivation + '」有关。我先接住它。');
        variants.push('我读到你心里有「' + top.label + '」。对于「' + typeData.name + '」来说，这种感受往往触动了你「' + typeData.coreFear + '」的部分。不急着分析，先把它放下来。');
        variants.push('你写下这些的那一刻，心里是「' + top.label + '」。对于「' + typeData.name + '」来说，这种感受值得被认真对待——它可能是你成长的信号。');
      } else {
        variants.push('谢谢你愿意把今天写下来，「' + typeData.name + '」。书写本身就是把心里的混乱变成能被看见的东西。');
        variants.push('我认真读了你写的这些，「' + typeData.name + '」。先不急着找答案，先陪你整理一下——从你的核心动机「' + typeData.coreMotivation + '」出发。');
      }
    } else {
      if (hasStrong) {
        variants.push('你今天带着「' + top.label + '」在走。它在你身体里可能已经停留一段时间了。我先接住它。');
        variants.push('我读到你心里有「' + top.label + '」。不急着分析，先把它放下来让自己看清楚。');
      } else {
        variants.push('谢谢你愿意把今天写下来。书写本身就是把心里的混乱变成能被看见的东西。');
        variants.push('我认真读了你写的这些。先不急着找答案，先陪你整理一下。');
      }
    }
    return pick(variants);
  }

  /* =========================================================
   *  事件解析工具：区分「事实」与「解读」
   * ========================================================= */

  // 解读性关键词——带有主观判断、推测、归因的词汇
  const INTERPRETATION_MARKERS = [
    '觉得', '感觉', '认为', '以为', '应该', '一定', '肯定', '肯定',
    '为什么不', '怎么不', '是不是', '难道', '可能', '也许', '大概',
    '显然', '分明', '一定', '老是', '总是', '从不', '永远', '从不',
    '被忽视', '被忽略', '不重要', '不被重视', '看不起', '针对我',
    '不够好', '比不上', '不如', '不配', '活该', '都怪', '是我的错',
    '一定是', '肯定是', '肯定是', '分明是', '就是', '说明', '意味着',
    '证明', '代表了', '说明了', '暗示了', '肯定是'
  ];

  // 事实性关键词——描述客观行为、事件、状态
  const FACT_MARKERS = [
    '说了', '做了', '没说', '没做', '去了', '没去', '打了', '没打',
    '发了', '没发', '给了', '没给', '告诉我', '没告诉我',
    '开会', '汇报', '发消息', '打电话', '见面', '吃饭', '讨论',
    '加班', '迟到', '早退', '分配', '安排', '提交', '通过', '拒绝',
    '今天', '昨天', '上午', '下午', '晚上', '上周', '这周', '这个月'
  ];

  function extractEventFacts(text) {
    const sentences = text.split(/[。.!?！？；;\n]/).map(s => s.trim()).filter(s => s.length > 4);
    const facts = [];
    const interpretations = [];

    sentences.forEach(s => {
      let factScore = 0;
      let interpScore = 0;

      for (const w of FACT_MARKERS) {
        if (s.includes(w)) factScore++;
      }
      for (const w of INTERPRETATION_MARKERS) {
        if (s.includes(w)) interpScore++;
      }

      // 如果包含「为什么」「怎么」等疑问词，倾向解读
      if (/为什么|怎么会|凭什么|怎么可以/.test(s)) interpScore += 2;

      if (interpScore > factScore) {
        interpretations.push(s);
      } else if (factScore > 0 || interpScore === 0) {
        facts.push(s);
      } else {
        // 无法明确判断时，短句倾向事实，长句倾向解读
        if (s.length < 20) facts.push(s);
        else interpretations.push(s);
      }
    });

    return { facts, interpretations };
  }

  /* =========================================================
   *  五段式动态分析构建函数
   *  1. 情境与事实：区分"事件"与"解读"
   *  2. 人格动力：识别人格特有的"价值感雷达"
   *  3. 行为模式：审视行为策略的有效性
   *  4. 核心需求与渴望：寻找痛苦背后的核心
   *  5. 建议：基于以上分析的针对性建议
   * ========================================================= */

  // ——— 模块 1：情境与事实 ———
  function buildSituationFact(text, emotions, themes, personality) {
    const typeData = personality ? ENNEAGRAM_TYPES[personality] : null;
    const { facts, interpretations } = extractEventFacts(text);
    let html = '';

    // 事件概述
    html += '<p style="margin-bottom:12px;">让我先帮你把今天这件事拆开来看——</p>';

    // 事实部分
    if (facts.length) {
      html += '<div style="margin:10px 0;padding:10px 14px;background:color-mix(in srgb, var(--accent) 8%, transparent);border-radius:10px;border-left:3px solid var(--accent);">';
      html += '<p style="font-size:12px;color:var(--accent-strong);font-weight:600;margin-bottom:6px;">客观事实（发生了什么）</p>';
      facts.slice(0, 4).forEach(f => {
        html += '<p style="font-size:13px;line-height:1.7;">• ' + escapeHtml(f) + '</p>';
      });
      html += '</div>';
    }

    // 解读部分
    if (interpretations.length) {
      html += '<div style="margin:10px 0;padding:10px 14px;background:color-mix(in srgb, var(--gold-soft) 12%, transparent);border-radius:10px;border-left:3px solid var(--gold);">';
      html += '<p style="font-size:12px;color:var(--gold);font-weight:600;margin-bottom:6px;">你的解读（你如何理解这件事）</p>';
      interpretations.slice(0, 4).forEach(i => {
        html += '<p style="font-size:13px;line-height:1.7;">• ' + escapeHtml(i) + '</p>';
      });
      html += '</div>';
    }

    // 人格视角的解读偏差提示
    if (typeData) {
      const blindSpotTips = {
        1: '作为「完美型」，你容易把"不够完美"的客观事实，自动升级为"我做错了"的主观解读。',
        2: '作为「助人型」，你容易把"别人没有主动求助"的事实，解读为"我不被需要"。',
        3: '作为「成就型」，你容易把"不是第一个被关注"的事实，解读为"我不够优秀"。',
        4: '作为「独特型」，你容易把"被平等对待"的事实，解读为"我又变得普通了"。',
        5: '作为「思考型」，你容易把"需要参与"的事实，解读为"我的能量会被消耗"。',
        6: '作为「忠诚型」，你容易把"不确定的结果"的事实，解读为"一定会有不好的事"。',
        7: '作为「活跃型」，你容易把"需要面对困难"的事实，解读为"被困住了"。',
        8: '作为「领袖型」，你容易把"不被认同"的事实，解读为"我在被削弱和控制"。',
        9: '作为「和平型」，你容易把"有分歧"的事实，解读为"关系要被破坏了"。'
      };
      html += '<p style="margin-top:12px;font-size:13px;color:var(--ink-1);line-height:1.7;">' + (blindSpotTips[personality] || '') + '</p>';
    }

    html += '<p style="margin-top:8px;font-size:12px;color:var(--ink-2);">（事实和解读之间的缝隙，往往是痛苦生长的地方。看清这个缝隙，是改变的第一步。）</p>';
    return html;
  }

  // ——— 模块 2：人格动力 ———
  function buildPersonalityDynamics(text, emotions, themes, patterns, personality) {
    const typeData = personality ? ENNEAGRAM_TYPES[personality] : null;
    let html = '';

    if (!typeData) {
      html += '<p style="color:var(--ink-2);font-size:13px;">（选择你的人格类型后，Mirror 会分析你特有的「价值感雷达」如何运作。）</p>';
      return html;
    }

    // 核心动机雷达
    html += '<p style="margin-bottom:10px;">作为「' + typeData.name + '」，你内心有一套自动运转的<strong>「价值感雷达」</strong>：</p>';

    html += '<div style="margin:10px 0;padding:10px 14px;background:color-mix(in srgb, var(--accent) 8%, transparent);border-radius:10px;">';
    html += '<p style="font-size:13px;line-height:1.7;"><strong>核心动机：</strong>' + typeData.coreMotivation + '</p>';
    html += '<p style="font-size:13px;line-height:1.7;margin-top:4px;"><strong>核心恐惧：</strong>' + typeData.coreFear + '</p>';
    html += '</div>';

    // 基于事件动态生成：这个事件如何触动了人格雷达
    const emotionLabels = emotions.map(e => e.label);
    const themeLabels = themes.map(t => t.label);
    const patternLabels = patterns.map(p => p.label);

    html += '<p style="margin-top:12px;">今天这件事，之所以让你产生如此强烈的反应，是因为它精准地触碰了你的雷达：</p>';

    // 关键词匹配：在用户文本中找到了哪些人格关键词
    const matchedKeywords = typeData.keywords.filter(kw => text.includes(kw));
    if (matchedKeywords.length > 0) {
      html += '<div style="margin:10px 0;padding:10px 14px;background:color-mix(in srgb, var(--gold-soft) 10%, transparent);border-radius:10px;border-left:3px solid var(--gold);">';
      html += '<p style="font-size:12px;color:var(--gold);font-weight:600;margin-bottom:6px;">你文本中的敏感触发词</p>';
      html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
      matchedKeywords.slice(0, 8).forEach(kw => {
        html += '<span style="background:color-mix(in srgb, var(--gold-soft) 20%, transparent);padding:3px 10px;border-radius:20px;font-size:12px;color:var(--ink-1);">' + escapeHtml(kw) + '</span>';
      });
      html += '</div></div>';
    }

    // 整合/解离方向提示
    const integrationType = ENNEAGRAM_TYPES[typeData.integrationDirection];
    const dissociationType = ENNEAGRAM_TYPES[typeData.dissociationDirection];
    const hasStressWords = /压力|焦虑|担心|害怕|难受|痛苦|崩溃/.test(text);
    const hasSafeWords = /开心|放松|踏实|满足|安心|感谢|感动/.test(text);

    html += '<div style="margin:12px 0;padding:10px 14px;border-radius:10px;border-left:3px solid var(--accent-strong);background:color-mix(in srgb, var(--accent) 6%, transparent);">';
    if (hasStressWords) {
      html += '<p style="font-size:13px;line-height:1.7;">你今天的文本中透露出<strong>压力信号</strong>，这意味着你可能在走向<strong>解离方向</strong>——展现出「' + dissociationType.name + '」的防御模式：' + dissociationType.unhealthyTraits + '。</p>';
      html += '<p style="font-size:13px;line-height:1.7;margin-top:6px;">而你的<strong>整合方向</strong>是「' + integrationType.name + '」——当你能感到安全和放松时，你会自然展现：' + integrationType.healthyTraits + '。</p>';
    } else if (hasSafeWords) {
      html += '<p style="font-size:13px;line-height:1.7;">你今天的文本中有<strong>积极信号</strong>，这可能意味着你正在接近<strong>整合方向</strong>——「' + integrationType.name + '」的特质：' + integrationType.healthyTraits + '。</p>';
    } else {
      html += '<p style="font-size:13px;line-height:1.7;">你的核心盲点：<strong>' + typeData.blindSpot + '</strong></p>';
    }
    html += '</div>';

    return html;
  }

  // ——— 模块 3：行为模式 ———
  function buildBehaviorPattern(text, emotions, themes, patterns, personality) {
    const typeData = personality ? ENNEAGRAM_TYPES[personality] : null;
    let html = '';

    html += '<p style="margin-bottom:10px;">从你描述的事件中，我看到了以下行为策略：</p>';

    // 基于检测到的认知模式，动态生成行为分析
    if (patterns.length > 0) {
      patterns.slice(0, 3).forEach((p, i) => {
        html += '<div style="margin:10px 0;padding:10px 14px;background:color-mix(in srgb, var(--accent) 6%, transparent);border-radius:10px;border-left:3px solid var(--accent-strong);">';
        html += '<p style="font-weight:600;color:var(--accent-strong);margin-bottom:4px;font-size:14px;">' + p.emoji + ' ' + p.label + '</p>';
        html += '<p style="font-size:13px;line-height:1.7;">' + p.pattern + '</p>';
        html += '<p style="font-size:12px;color:var(--ink-2);margin-top:4px;">心理学视角：' + p.concept + '</p>';
        html += '</div>';
      });
    } else {
      html += '<p style="font-size:13px;color:var(--ink-1);line-height:1.7;">从你的描述中，我暂时没有识别到明显的认知模式。这本身也是有价值的信息——你可能正处于一个相对清醒的状态，或者在用一种更隐性的方式应对。</p>';
    }

    // 行为策略有效性审视
    html += '<div style="margin:14px 0;padding:10px 14px;background:color-mix(in srgb, var(--gold-soft) 10%, transparent);border-radius:10px;">';
    html += '<p style="font-weight:600;color:var(--gold);margin-bottom:6px;font-size:13px;">审视这些策略的有效性</p>';

    if (patterns.some(p => p.id === 'conflict_avoidance' || p.id === 'emotional_suppression' || p.id === 'need_suppressed')) {
      html += '<p style="font-size:13px;line-height:1.7;">你今天的应对方式（回避冲突 / 压抑情绪 / 隐藏需求）可能在短期内保护了你，但长期来看，它让你<strong>失去了一次被真实看见的机会</strong>。你选择沉默的那一刻，别人并不知道你心里发生了什么。</p>';
    } else if (patterns.some(p => p.id === 'overthinking' || p.id === 'procrastination')) {
      html += '<p style="font-size:13px;line-height:1.7;">你的应对方式（反复思虑 / 拖延行动）消耗了大量心理能量，但这些能量并没有转化为实际解决问题。你可能一直在"想"，却很少在"做"。</p>';
    } else if (patterns.some(p => p.id === 'self_blame' || p.id === 'rejection_sensitive')) {
      html += '<p style="font-size:13px;line-height:1.7;">你的应对方式（自我攻击 / 对否定敏感）让你把所有问题都内归因——"都是我的错"。但事实是，大多数事情都不是一个人的责任。</p>';
    } else if (patterns.some(p => p.id === 'people_pleasing' || p.id === 'attachment_anxious')) {
      html += '<p style="font-size:13px;line-height:1.7;">你的应对方式（讨好他人 / 关系焦虑）让你不断向外寻求确认，但这个缺口是永远填不满的——因为真正需要确认的那个人，是你自己。</p>';
    } else {
      html += '<p style="font-size:13px;line-height:1.7;">停下来想一下：你今天的应对方式，是在帮你靠近你想要的结果，还是在帮你回避你害怕的结果？</p>';
    }

    html += '</div>';
    return html;
  }

  // ——— 模块 4：核心需求与渴望 ———
  function buildCoreDesire(text, emotions, themes, patterns, personality) {
    const typeData = personality ? ENNEAGRAM_TYPES[personality] : null;
    let html = '';

    html += '<p style="margin-bottom:10px;">表面上的情绪和反应只是冰山一角。让我们潜入水面之下，看看你真正在渴望什么：</p>';

    if (typeData) {
      // 基于人格类型的核心需求
      const desireMap = {
        1: { surface: '你表面上在追求正确和完美', deep: '但你真正渴望的是：被接纳——不是因为你做对了什么，而是因为你就是值得被接纳的。', trap: '你的陷阱是以为"做得完美 = 被接纳"，但完美的标准是无穷尽的。' },
        2: { surface: '你表面上在给予和帮助别人', deep: '但你真正渴望的是：被爱——不是因为你有用，而是因为你存在。', trap: '你的陷阱是用付出来"购买"爱，但买来的爱永远让你不安——因为你害怕一旦停止付出，爱也会消失。' },
        3: { surface: '你表面上在追求成就和认可', deep: '但你真正渴望的是：被看见——不是你做了什么，而是你这个人本身。', trap: '你的陷阱是把"做了什么"等同于"我是谁"，但成就总会被超越，而你是不可替代的。' },
        4: { surface: '你表面上在寻找独特和深刻', deep: '但你真正渴望的是：被理解——有人能穿透表面的你，看到内心那个真实、脆弱、但完整的自己。', trap: '你的陷阱是用痛苦来证明深刻，但真正的深刻不需要痛苦来证明。' },
        5: { surface: '你表面上在积累知识和理解', deep: '但你真正渴望的是：安全感——不是来自知道一切，而是来自"我不知道，但我也不会因此被毁灭"的底气。', trap: '你的陷阱是用知识建造堡垒，但堡垒越厚，连接越少。' },
        6: { surface: '你表面上在寻找安全和确定', deep: '但你真正渴望的是：信任——不是别人不会背叛你，而是你相信自己能承受任何结果。', trap: '你的陷阱是以为"想清楚所有风险 = 安全"，但真正的不安全感来自你对自身能力的怀疑。' },
        7: { surface: '你表面上在追逐快乐和自由', deep: '但你真正渴望的是：完整——不是只有快乐，而是能够面对所有情绪，包括痛苦、无聊和悲伤。', trap: '你的陷阱是用忙碌逃避痛苦，但被逃避的痛苦会以空虚的方式回来找你。' },
        8: { surface: '你表面上在追求强大和控制', deep: '但你真正渴望的是：被温柔对待——在一个安全的空间里，你不必一直坚强。', trap: '你的陷阱是以为"强大 = 不被伤害"，但真正的力量来自敢于展示脆弱。' },
        9: { surface: '你表面上在追求和平与和谐', deep: '但你真正渴望的是：被重视——你的声音、你的需求、你的立场，和别人的一样重要。', trap: '你的陷阱是用消失来维持和平，但和平不应该以你的存在为代价。' }
      };
      const d = desireMap[personality];
      html += '<div style="margin:10px 0;padding:12px 14px;background:color-mix(in srgb, var(--accent) 8%, transparent);border-radius:10px;">';
      html += '<p style="font-size:13px;line-height:1.7;">' + d.surface + '……</p>';
      html += '<p style="font-size:13px;line-height:1.7;margin-top:6px;font-weight:500;color:var(--accent-strong);">' + d.deep + '</p>';
      html += '</div>';
      html += '<div style="margin:8px 0;padding:10px 14px;background:color-mix(in srgb, var(--gold-soft) 10%, transparent);border-radius:10px;">';
      html += '<p style="font-size:13px;line-height:1.7;">' + d.trap + '</p>';
      html += '</div>';
    }

    // 基于事件内容的补充分析
    const hasComparison = /比较|比不上|不如|比别人|差|优越|输|赢/.test(text);
    const hasApproval = /认可|肯定|表扬|赞赏|重视|关注|看见|注意|在乎/.test(text);
    const hasControl = /控制|掌控|安排|决定|选择|自由|被管|被安排|被控制/.test(text);
    const hasConnection = /孤独|一个人|没人|不被理解|疏远|冷淡|不理|忽略/.test(text);

    if (hasComparison || hasApproval || hasControl || hasConnection) {
      html += '<p style="margin-top:12px;font-size:13px;color:var(--ink-1);">从你今天写的内容中，我还读到了你内心深处的一些声音：</p>';
      html += '<div style="margin-top:8px;">';
      if (hasComparison) html += '<p style="font-size:13px;line-height:1.7;">• 你在<strong>比较</strong>——比较的背后是对"我足够好吗"的追问。</p>';
      if (hasApproval) html += '<p style="font-size:13px;line-height:1.7;">• 你渴望<strong>被看见和认可</strong>——这种渴望本身没有问题，但你对获取认可的方式可能需要审视。</p>';
      if (hasControl) html += '<p style="font-size:13px;line-height:1.7;">• 你在关注<strong>掌控感</strong>——失控感往往是深层不安的表现。</p>';
      if (hasConnection) html += '<p style="font-size:13px;line-height:1.7;">• 你感受到了<strong>连接的缺失</strong>——孤独感不是你真的一个人，而是你感觉自己没有被真正理解。</p>';
      html += '</div>';
    }

    return html;
  }

  // ——— 模块 5：建议 ———
  function buildAdvice(text, emotions, themes, patterns, personality) {
    const typeData = personality ? ENNEAGRAM_TYPES[personality] : null;
    let html = '';
    const tips = [];

    // 基于具体事件的动态建议
    if (patterns.length > 0) {
      const topPatterns = patterns.slice(0, 2);
      topPatterns.forEach(p => {
        const dynamicTips = {
          'people_pleasing': '今天对一件你本会自动答应的事，练习先说「让我想一想」。不是拒绝，是给自己三秒钟的缓冲——这三秒里，你在练习把「我的需求」和「别人的需求」放在同一个天平上。',
          'rejection_sensitive': '如果今天有人说了让你不舒服的话，试着在心里把它翻译成：「这是他的判断，不是事实。」他的判断关于他，不关于你。',
          'conflict_avoidance': '下次你想沉默的时候，试着说出一句最短的真话。不需要长篇大论——哪怕只是「我不同意」三个字。冲突不会毁掉关系，假装没有冲突才会。',
          'overthinking': '对一个反复在转的问题，给自己设一个「思考截止时间」。比如今晚 9 点，如果还没想清楚，就写下来然后合上。文字会替你记住，大脑不需要一直加班。',
          'self_blame': '如果今天你又在对自己说「都怪我」，试着加一个字：「都怪我……吗？」这个问号会打开一个可能性——也许不是你的错，也许事情比你想的更复杂。',
          'need_suppressed': '今天试着对一个你信任的人说出一个你一直没说出口的需求。不需要解释，不需要铺垫，只需要一句话：「我想要……」',
          'attachment_anxious': '当你又在从一条消息里解读对方的态度时，停下来问自己：「我现在是在回应事实，还是在回应恐惧？」如果答案是恐惧，把手机放下来，做十次深呼吸。',
          'procrastination': '选一件你在拖延的事，拆成最小的第一步——比如「打开文档」或者「写一个标题」。然后只做这一步。不骗你，90% 的阻力都在「开始」之前。',
          'should_statements': '把你脑子里那句「我应该」换成「我可以选择」。不是不做，而是从「被迫」变成「主动选择」。这两个词的心理重量完全不同。',
          'emotional_suppression': '找到一个安全的地方（日记、录音、或者一个信任的人），把你今天压下去的那个感受说出来。不需要逻辑，不需要整理，只需要释放。'
        };
        if (dynamicTips[p.id]) tips.push(dynamicTips[p.id]);
      });
    }

    // 基于人格类型的专属行动建议
    if (typeData) {
      tips.push(typeData.advice[0]);
    }

    // 基于情绪的补充
    if (emotions.length > 0) {
      const mainE = emotions[0];
      const emotionTips = {
        '愤怒': '愤怒是信号，说明你的边界被触碰了。与其压下去，不如把它当作情报——它在告诉你什么对你重要。',
        '委屈 / 失落': '失落感就像一个信使，它在告诉你：你期待了一些东西，但没有得到。问题不在于期待本身，而在于你把期待放在了谁身上。',
        '焦虑 / 不安': '焦虑是你对未来支付的利息。但大多数让你焦虑的事，要么不会发生，要么即使发生了你也有能力应对。你现在能做的最好的事，是回到当下。',
        '羞耻 / 尴尬': '羞耻感会告诉你"我不配"。但它说的是谎话。不配的感觉是过去的经验在你身上留下的回声，不是关于你现在的事实。'
      };
      if (emotionTips[mainE.label]) tips.push(emotionTips[mainE.label]);
    }

    // 限制输出 3-4 条
    const final = tips.slice(0, 4);
    html += '<ul class="bullet-list">';
    final.forEach(t => {
      html += '<li style="margin-bottom:12px;line-height:1.7;">' + t + '</li>';
    });
    html += '</ul>';

    // 结尾——基于具体事件的鼓励语
    if (typeData) {
      html += '<div style="margin-top:16px;padding:12px 14px;background:color-mix(in srgb,var(--gold-soft) 15%,transparent);border-radius:10px;">';
      html += '<p style="font-size:13px;line-height:1.7;color:var(--ink-1);">你今天的痛苦不是因为你不够好，而是因为你是一个活生生的人——会受伤、会害怕、会渴望。这次的体验，恰恰是你内心那个渴望成长的「' + typeData.name + '」在提醒你：你有机会看见自己平时看不见的部分。看见，就是改变的开始。</p>';
      html += '</div>';
    }

    return html;
  }

  /* =========================================================
   *  AI 平台配置（多平台多模型）
   * ========================================================= */
  const AI_PLATFORMS = {
    deepseek: {
      name: 'DeepSeek',
      apiUrl: 'https://api.deepseek.com/chat/completions',
      models: [
        { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro（深度思考）' },
        { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash（快速响应）' }
      ],
      placeholder: 'sk-xxxxxxxxxxxxxxxx',
      hint: '获取地址：platform.deepseek.com → API Keys → 创建'
    },
    siliconflow: {
      name: '硅基流动',
      apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
      models: [
        { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3' },
        { id: 'Qwen/Qwen3-235B-A22B', name: 'Qwen3 235B' },
        { id: 'THUDM/glm-4-9b-chat', name: 'GLM-4 9B' }
      ],
      placeholder: 'sk-xxxxxxxxxxxxxxxx',
      hint: '获取地址：cloud.siliconflow.cn → API 密钥 → 创建'
    },
    zhipu: {
      name: '智谱 GLM',
      apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      models: [
        { id: 'glm-4-plus', name: 'GLM-4 Plus' },
        { id: 'glm-4-flash', name: 'GLM-4 Flash（免费）' }
      ],
      placeholder: 'xxxxxxxxxxxxxxxx.xxxxxx',
      hint: '获取地址：open.bigmodel.cn → API Keys → 创建'
    },
    qwen: {
      name: '通义千问',
      apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      models: [
        { id: 'qwen-max', name: 'Qwen Max' },
        { id: 'qwen-plus', name: 'Qwen Plus' },
        { id: 'qwen-turbo', name: 'Qwen Turbo' }
      ],
      placeholder: 'sk-xxxxxxxxxxxxxxxx',
      hint: '获取地址：dashscope.console.aliyun.com → API Keys → 创建'
    }
  };

  // 设置管理
  function loadAnalysisMode() { return localStorage.getItem('mirror_analysis_mode') || 'local'; }
  function saveAnalysisMode(mode) { localStorage.setItem('mirror_analysis_mode', mode); }
  function loadAIPlatform() { return localStorage.getItem('mirror_ai_platform') || 'deepseek'; }
  function saveAIPlatform(p) { localStorage.setItem('mirror_ai_platform', p); }
  function loadAIModel() { return localStorage.getItem('mirror_ai_model') || ''; }
  function saveAIModel(m) { localStorage.setItem('mirror_ai_model', m); }
  function loadApiKey() { return localStorage.getItem('mirror_ai_key') || ''; }
  function saveApiKey(key) { localStorage.setItem('mirror_ai_key', key); }

  // 构建系统 Prompt
  function buildSystemPrompt() {
    return `你是一位深谙九型人格（Enneagram）体系的专业心理咨询师，同时也是用户的「镜子」——帮助他们从日常事件中照见真实的自己。

## 你的角色
- 名字：Mirror
- 风格：温暖、深刻、不评判、富有洞察力
- 语言：中文，口语化但专业，像一位智慧的朋友在说话
- 底线：绝不评判用户，始终站在用户这边

## 九型人格核心知识

九型人格将人分为三种中心、九种类型：

**腹中心（本能中心）**：
- 1号 完美型：核心动机"我必须做正确的事，才能被接纳"，核心恐惧"做错事、不完美、失控"
- 8号 领袖型：核心动机"我必须强大和掌控，才能避免被伤害"，核心恐惧"脆弱、被控制、被伤害"
- 9号 和平型：核心动机"我必须保持和平，才能被接纳"，核心恐惧"冲突、被分离、失去连接"

**心中心（情感中心）**：
- 2号 助人型：核心动机"我必须被需要，才能证明我的价值"，核心恐惧"不被需要、被拒绝、孤独"
- 3号 成就型：核心动机"我必须成功，才能被认可"，核心恐惧"失败、不被认可、默默无闻"
- 4号 独特型：核心动机"我必须与众不同，才能找到意义"，核心恐惧"平庸、被抛弃、找不到自我"

**脑中心（思维中心）**：
- 5号 思考型：核心动机"我必须了解一切，才能感到安全"，核心恐惧"无知、被侵犯、资源不足"
- 6号 忠诚型：核心动机"我必须找到安全和信任，才能安心"，核心恐惧"不安全、被背叛、不确定"
- 7号 活跃型：核心动机"我必须保持快乐和自由，才能避免痛苦"，核心恐惧"痛苦、限制、被束缚"

每种人格都有整合方向（安全/成长时走向）和解离方向（压力/焦虑时走向）。

## 分析框架

请严格按照以下五个模块输出分析，模块之间用 "||||" 分隔：

**模块1：情境与事实**
- 区分用户描述中的"客观事实"和"主观解读"
- 帮助用户看到：哪些是真实发生的，哪些是自己加上的意义
- 结合用户的人格类型，指出其特有的"解读偏差"

**模块2：人格动力**
- 识别该事件如何触动了用户人格的"核心动机"和"核心恐惧"
- 分析用户的"价值感雷达"在这次事件中如何运作
- 指出用户是否正在走向整合方向或解离方向

**模块3：行为模式**
- 分析用户描述中隐含的行为策略
- 评估这些策略的有效性：是在解决问题还是在回避问题？
- 用心理学视角解读行为背后的动力

**模块4：核心需求与渴望**
- 深入表面情绪之下，寻找真正的需求
- 区分"表层渴望"和"深层需求"
- 指出可能存在的"心理陷阱"

**模块5：建议**
- 给出1-3条具体、可操作的行动建议
- 建议必须结合用户的人格类型和具体事件
- 避免空洞的鸡汤，每条建议都要有具体的行动步骤
- 最后给一句温暖但有力的鼓励

## 输出格式要求（极其重要，必须严格遵守）

你必须严格按照以下格式输出。五个模块之间必须且只能使用一个 ★ 符号作为分隔符，不要添加任何其他分隔标记。

格式示例：
---
[模块1的内容]
★
[模块2的内容]
★
[模块3的内容]
★
[模块4的内容]
★
[模块5的内容]
---

要求：
1. 模块之间必须使用 ★ 分隔，不要省略，不要添加多余
2. 每个模块内部使用 Markdown 格式（粗体 **、列表 - 等）
3. 不要在模块开头添加 "模块1：" 这样的编号标题
4. 语气温暖、专业、不评判
5. 分析要针对用户的具体事件，不要泛泛而谈
6. 如果用户没有设置人格类型，基于事件内容推断最可能的人格类型并注明`;
  }

  // 构建用户 Prompt
  function buildUserPrompt(text, emotions, themes, patterns, personality, typeData) {
    const emotionInfo = emotions.map(e => e.label).join('、') || '未检测到明显情绪';
    const themeInfo = themes.map(t => t.label).join('、') || '未识别到主题领域';
    const patternInfo = patterns.map(p => p.label).join('、') || '未识别到认知模式';

    let prompt = `用户今天写下的内容：\n\n"""\n${text}\n"""\n\n`;

    prompt += `【辅助分析信息】\n`;
    prompt += `- 检测到的情绪：${emotionInfo}\n`;
    prompt += `- 事件涉及领域：${themeInfo}\n`;
    prompt += `- 可能的认知模式：${patternInfo}\n`;

    if (typeData) {
      prompt += `- 用户已确认人格类型：${typeData.name}（${typeData.nameEn}）\n`;
      prompt += `- 核心动机：${typeData.coreMotivation}\n`;
      prompt += `- 核心恐惧：${typeData.coreFear}\n`;
      prompt += `- 整合方向：${typeData.integrationName}（健康时走向）\n`;
      prompt += `- 解离方向：${typeData.dissociationName}（压力时走向）\n`;
      prompt += `- 核心盲点：${typeData.blindSpot}\n`;
    } else {
      prompt += `- 用户尚未确认人格类型，请基于事件内容推断最可能的人格类型\n`;
    }

    prompt += `\n请按照系统提示中的五段式框架，用 ★ 分隔五个模块，针对用户的具体事件进行分析。`;

    return prompt;
  }

  // 流式调用 AI API（支持多平台）
  async function callAIAPI(systemPrompt, userPrompt, onChunk, onError, onComplete) {
    const platformId = loadAIPlatform();
    const platform = AI_PLATFORMS[platformId];
    const apiKey = loadApiKey();
    const modelId = loadAIModel();

    if (!apiKey) {
      onError('请先设置 API Key');
      return;
    }
    if (!platform) {
      onError('未知的 AI 平台：' + platformId);
      return;
    }

    // 智谱 GLM 使用不同的 auth header 格式
    const isZhipu = platformId === 'zhipu';
    const headers = {
      'Content-Type': 'application/json'
    };
    if (isZhipu) {
      headers['Authorization'] = 'Bearer ' + apiKey;
    } else {
      headers['Authorization'] = 'Bearer ' + apiKey;
    }

    // 如果没有保存模型，使用平台第一个模型
    const model = modelId || platform.models[0].id;

    try {
      const response = await fetch(platform.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 4096
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        onError('API 调用失败：' + (errorData.error?.message || response.statusText));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // 保留不完整的最后一行

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') {
            onComplete();
            return;
          }
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
      onComplete();
    } catch (err) {
      onError('网络错误：' + err.message);
    }
  }

  // 渲染流式输出到分析卡片
  const SECTION_SEP = '★';

  function renderStreamingAnalysis(containerIds) {
    const buffers = {};
    let fullText = '';

    containerIds.forEach(id => {
      buffers[id] = '';
      $(id).innerHTML = '<div class="streaming-indicator">正在分析中……</div>';
    });

    return {
      append: (text) => {
        fullText += text;

        // 在完整文本中查找所有分隔符
        const positions = [];
        let pos = fullText.indexOf(SECTION_SEP);
        while (pos !== -1) {
          positions.push(pos);
          pos = fullText.indexOf(SECTION_SEP, pos + SECTION_SEP.length);
        }

        // 根据分隔符位置分配内容到对应容器
        let start = 0;
        let sectionIdx = 0;

        for (const sepPos of positions) {
          if (sectionIdx >= containerIds.length) break;
          const content = fullText.substring(start, sepPos).trim();
          buffers[containerIds[sectionIdx]] = content;
          $(containerIds[sectionIdx]).innerHTML = markdownToHtml(content);
          start = sepPos + SECTION_SEP.length;
          sectionIdx++;
        }

        // 最后一个分隔符之后的实时内容（流式显示中）
        if (sectionIdx < containerIds.length && start < fullText.length) {
          const remaining = fullText.substring(start).trim();
          buffers[containerIds[sectionIdx]] = remaining;
          $(containerIds[sectionIdx]).innerHTML = markdownToHtml(remaining);
        }
      },
      finalize: () => {
        // 最后一次完整的分配
        const positions = [];
        let pos = fullText.indexOf(SECTION_SEP);
        while (pos !== -1) {
          positions.push(pos);
          pos = fullText.indexOf(SECTION_SEP, pos + SECTION_SEP.length);
        }

        let start = 0;
        let sectionIdx = 0;
        for (const sepPos of positions) {
          if (sectionIdx >= containerIds.length) break;
          const content = fullText.substring(start, sepPos).trim();
          buffers[containerIds[sectionIdx]] = content;
          $(containerIds[sectionIdx]).innerHTML = markdownToHtml(content);
          start = sepPos + SECTION_SEP.length;
          sectionIdx++;
        }

        // 最后一段
        if (sectionIdx < containerIds.length) {
          const remaining = fullText.substring(start).trim();
          buffers[containerIds[sectionIdx]] = remaining;
          $(containerIds[sectionIdx]).innerHTML = markdownToHtml(remaining);
        }

        // Fallback：如果所有内容都进了第一个容器（分隔符未生效），尝试智能拆分
        const firstContent = buffers[containerIds[0]] || '';
        if (firstContent && !positions.length) {
          // 按 \n\n 拆分，尽量平均分配到5个容器
          const blocks = firstContent.split(/\n{2,}/).filter(b => b.trim());
          if (blocks.length >= 2) {
            const perCard = Math.ceil(blocks.length / containerIds.length);
            containerIds.forEach((id, i) => {
              const slice = blocks.slice(i * perCard, (i + 1) * perCard);
              if (slice.length) {
                buffers[id] = slice.join('\n\n');
                $(id).innerHTML = markdownToHtml(buffers[id]);
              }
            });
          }
        }

        // 确保所有容器都有内容
        containerIds.forEach(id => {
          if (!buffers[id].trim()) {
            $(id).innerHTML = '<p style="color:var(--ink-2);font-size:13px;">（此模块暂无分析内容）</p>';
          }
        });
      }
    };
  }

  // 简单的 Markdown 转 HTML
  function markdownToHtml(md) {
    if (!md) return '';
    // 先 escape HTML 特殊字符（& < > " '）
    let html = escapeHtml(md);
    // 粗体 **text** → 主题强调色高亮
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--accent-strong);font-weight:600;">$1</strong>');
    // 斜体 *text*
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // 换行处理
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  /* =========================================================
   *  本地存储
   * ========================================================= */
  const LS = {
    entries: 'mirror_entries_v2',
    desire: 'mirror_desire_v2',
    profile: 'mirror_profile_v2'
  };

  function loadEntries() {
    try { return JSON.parse(localStorage.getItem(LS.entries) || '[]'); }
    catch (e) { return []; }
  }
  function saveEntries(list) {
    localStorage.setItem(LS.entries, JSON.stringify(list));
  }
  function getDesire() { return localStorage.getItem(LS.desire) || ''; }
  function setDesire(d) { localStorage.setItem(LS.desire, d); }

  /* =========================================================
   *  Tab 切换
   * ========================================================= */
  function switchTab(name) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    $('#tab-' + name).classList.add('active');
    document.querySelector('.nav-btn[data-tab="' + name + '"]').classList.add('active');

    if (name === 'mirror') renderProfile();
    if (name === 'report') renderReports();
    if (name === 'trend') renderTrend();
  }

  /* =========================================================
   *  主分析流程（结合九型人格）
   * ========================================================= */
  function onAnalyze() {
    const text = $('#free-input').value.trim();
    const dontSave = $('#dont-save').checked;
    const personality = getPersonality();

    if (!text) {
      const area = $('#analysis-area');
      area.hidden = true;
      $('#safety-panel').hidden = true;
      $('#echo-panel').hidden = true;
      alert('先写点什么，镜子才能照见你～');
      return;
    }

    // 1. 高风险检测
    const risk = detectRisk(text);
    if (risk.type) {
      showSafety(risk, text);
      $('#analysis-area').hidden = true;
      $('#echo-panel').hidden = true;
      if (!dontSave) {
        const entry = {
          date: todayStr(),
          friendly_date: friendlyDate(),
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          text,
          emotions: analyzeEmotions(text),
          themes: analyzeThemes(text),
          patterns: [],
          desire: '',
          personality,
          risk: true,
          riskType: risk.matches.join('、')
        };
        const list = loadEntries();
        list.push(entry);
        saveEntries(list);
        $('#save-hint').textContent = '✓ 已保存。如果你现在需要帮助，请联系可信任的人或拨打援助热线。';
      } else {
        $('#save-hint').textContent = '本次未保存。如果你需要帮助，请联系可信任的人。';
      }
      $('#save-hint').hidden = false;
      setTimeout(() => $('#safety-panel').scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      return;
    }

    // 2. 常规分析（基于人格类型）
    const emotions = analyzeEmotions(text);
    const themes = analyzeThemes(text);
    const patterns = analyzePatterns(text);
    const desire = getDesire();
    const typeData = personality ? ENNEAGRAM_TYPES[personality] : null;

    // echo（结合人格类型）
    $('#echo-panel').hidden = false;
    $('#echo-text').textContent = buildEcho(text, emotions, personality);

    // 五段式动态分析（基于事件 + 人格类型）
    $('#analysis-area').hidden = false;

    // 判断分析模式
    const analysisMode = loadAnalysisMode();
    const apiKey = loadApiKey();

    if (analysisMode === 'ai' && apiKey) {
      // AI 流式分析
      const containerIds = ['#body-what', '#body-touch', '#body-pattern', '#body-fear', '#body-action'];
      const renderer = renderStreamingAnalysis(containerIds);

      const systemPrompt = buildSystemPrompt();
      const userPrompt = buildUserPrompt(text, emotions, themes, patterns, personality, typeData);

      callAIAPI(
        systemPrompt,
        userPrompt,
        (chunk) => renderer.append(chunk),
        (errMsg) => {
          // 出错时回退到本地引擎
          const platformName = AI_PLATFORMS[loadAIPlatform()]?.name || 'AI';
          $('#body-what').innerHTML = '<p style="color:var(--red);font-size:13px;">' + platformName + ' 调用失败：' + errMsg + '</p><p style="font-size:13px;color:var(--ink-2);">已自动切换为本地引擎。</p>';
          $('#body-what').innerHTML += buildSituationFact(text, emotions, themes, personality);
          $('#body-touch').innerHTML = buildPersonalityDynamics(text, emotions, themes, patterns, personality);
          $('#body-pattern').innerHTML = buildBehaviorPattern(text, emotions, themes, patterns, personality);
          $('#body-fear').innerHTML = buildCoreDesire(text, emotions, themes, patterns, personality);
          $('#body-action').innerHTML = buildAdvice(text, emotions, themes, patterns, personality);
        },
        () => renderer.finalize()
      );
    } else {
      // 本地规则引擎
      $('#body-what').innerHTML = buildSituationFact(text, emotions, themes, personality);
      $('#body-touch').innerHTML = buildPersonalityDynamics(text, emotions, themes, patterns, personality);
      $('#body-pattern').innerHTML = buildBehaviorPattern(text, emotions, themes, patterns, personality);
      $('#body-fear').innerHTML = buildCoreDesire(text, emotions, themes, patterns, personality);
      $('#body-action').innerHTML = buildAdvice(text, emotions, themes, patterns, personality);
    }

    // 反馈按钮复位
    document.querySelectorAll('.fb-btn').forEach(b => b.classList.remove('selected'));
    $('#fb-result').textContent = '';

    // 保存（记录人格类型）
    if (!dontSave) {
      const entry = {
        date: todayStr(),
        friendly_date: friendlyDate(),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        text,
        emotions,
        themes,
        patterns,
        desire,
        personality,
        risk: false
      };
      const list = loadEntries();
      list.push(entry);
      saveEntries(list);
      $('#save-hint').textContent = '✓ 已保存到你的记录。可在「我的镜像」查看。';
    } else {
      $('#save-hint').textContent = '本次未保存。';
    }

    // 滚动到分析区
    setTimeout(() => {
      $('#echo-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  // 安全提醒
  function showSafety(risk, text) {
    const panel = $('#safety-panel');
    panel.hidden = false;
    $('#safety-title').textContent = '我读到你此刻在很艰难的位置';

    let body = '<p>从你写下的内容里，我读到一些需要被认真对待的信号——';
    if (risk.matches.length) body += '<strong>' + risk.matches.join('、') + '</strong>。';
    body += '</p>';
    body += '<p>我无法代替专业人员去判断和干预，但我想先告诉你一件事：<strong>你此刻感受到的，不是最终答案。</strong></p>';
    body += '<p>请不要一个人扛着。先打一个电话——打给一个你还能想到的人。</p>';
    body += '<p>如果你担心别人无法理解，也可以直接拨打下面的心理援助热线。它们是专业的、24 小时的。</p>';
    $('#safety-body').innerHTML = body;
  }

  /* =========================================================
   *  我的镜像 —— 用户画像（结合九型人格）
   * ========================================================= */
  function renderProfile() {
    const entries = loadEntries();
    const desire = getDesire();
    const personality = getPersonality();
    const typeData = personality ? ENNEAGRAM_TYPES[personality] : null;

    // 人格类型显示
    const personalityEl = document.createElement('div');
    personalityEl.id = 'personality-display';
    personalityEl.className = 'card-d';
    personalityEl.innerHTML = '';
    
    if (typeData) {
      const integrationType = ENNEAGRAM_TYPES[typeData.integrationDirection];
      const dissociationType = ENNEAGRAM_TYPES[typeData.dissociationDirection];
      
      personalityEl.innerHTML = `
        <div class="section-title">✦ 我的人格类型</div>
        
        <div style="display:flex;align-items:center;justify-content:center;margin-top:16px;">
          <svg viewBox="0 0 200 200" width="180" height="180" style="filter:drop-shadow(0 4px 12px rgba(0,0,0,0.1));">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:var(--accent)" />
                <stop offset="100%" style="stop-color:var(--accent-strong)" />
              </linearGradient>
              <linearGradient id="integGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:var(--green)" />
                <stop offset="100%" style="stop-color:var(--green-strong)" />
              </linearGradient>
              <linearGradient id="dissoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:var(--red)" />
                <stop offset="100%" style="stop-color:var(--red-strong)" />
              </linearGradient>
            </defs>
            
            <circle cx="100" cy="100" r="75" fill="none" stroke="var(--line)" stroke-width="1" />
            <circle cx="100" cy="100" r="55" fill="none" stroke="var(--line)" stroke-width="1" />
            <circle cx="100" cy="100" r="35" fill="none" stroke="var(--line)" stroke-width="1" />
            
            <line x1="100" y1="25" x2="100" y2="175" stroke="var(--line)" stroke-width="1" />
            <line x1="25" y1="100" x2="175" y2="100" stroke="var(--line)" stroke-width="1" />
            <line x1="43" y1="43" x2="157" y2="157" stroke="var(--line)" stroke-width="1" />
            <line x1="157" y1="43" x2="43" y2="157" stroke="var(--line)" stroke-width="1" />
            
            ${getEnneagramPoints()}
            
            ${getIntegrationLine(typeData, personality, typeData.integrationDirection)}
            
            ${getDissociationLine(typeData, personality, typeData.dissociationDirection)}
            
            <circle cx="${getPointX(parseInt(personality))}" cy="${getPointY(parseInt(personality))}" r="12" fill="var(--accent-strong)" />
            <text x="${getPointX(parseInt(personality))}" y="${getPointY(parseInt(personality))}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10" font-weight="bold">${personality}</text>
          </svg>
        </div>
        
        <div style="text-align:center;margin-top:8px;">
          <div style="font-size:28px;font-weight:500;color:var(--accent-strong);">${personality}</div>
          <div style="font-size:18px;color:var(--ink-0);margin-top:4px;">${typeData.name}</div>
          <div style="font-size:12px;color:var(--ink-2);margin-top:2px;">${typeData.nameEn} · ${typeData.wing}</div>
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px;">
          <div style="background:color-mix(in srgb, var(--green) 10%, transparent);padding:12px;border-radius:10px;text-align:center;">
            <div style="font-size:10px;color:var(--green-strong);margin-bottom:4px;">🔄 整合方向</div>
            <div style="font-size:14px;color:var(--ink-0);font-weight:500;">${integrationType ? integrationType.name : ''}</div>
            <div style="font-size:10px;color:var(--ink-2);">${typeData.integrationDirection}号</div>
          </div>
          <div style="background:color-mix(in srgb, var(--red) 10%, transparent);padding:12px;border-radius:10px;text-align:center;">
            <div style="font-size:10px;color:var(--red-strong);margin-bottom:4px;">⚠️ 解离方向</div>
            <div style="font-size:14px;color:var(--ink-0);font-weight:500;">${dissociationType ? dissociationType.name : ''}</div>
            <div style="font-size:10px;color:var(--ink-2);">${typeData.dissociationDirection}号</div>
          </div>
        </div>
        
        <div class="section-sub-title">核心动机</div>
        <div style="color:var(--ink-1);font-size:14px;background:color-mix(in srgb, var(--accent) 15%, transparent);padding:12px;border-radius:10px;text-align:center;">${typeData.coreMotivation}</div>
        
        <div class="section-sub-title">核心恐惧</div>
        <div style="color:var(--ink-1);font-size:14px;text-align:center;">${typeData.coreFear}</div>
        
        <div class="section-sub-title">成长方向</div>
        <div style="color:var(--ink-1);font-size:14px;">${typeData.growthDirection}</div>
        
        <div class="section-sub-title">中心</div>
        <div style="color:var(--ink-1);font-size:14px;">${typeData.bodyCenter}</div>
        
        <button id="re-test-btn" class="ghost-btn" style="width:100%;margin-top:16px;">重新测试</button>
      `;
    }
    
    function getPointX(num) {
      const angle = (num - 1) * 40 - 90;
      return 100 + 70 * Math.cos(angle * Math.PI / 180);
    }
    
    function getPointY(num) {
      const angle = (num - 1) * 40 - 90;
      return 100 + 70 * Math.sin(angle * Math.PI / 180);
    }
    
    function getEnneagramPoints() {
      let points = '';
      for (let i = 1; i <= 9; i++) {
        const x = getPointX(i);
        const y = getPointY(i);
        points += `<circle cx="${x}" cy="${y}" r="5" fill="var(--ink-2)" />`;
        points += `<text x="${x}" y="${y + 14}" text-anchor="middle" fill="var(--ink-2)" font-size="9">${i}</text>`;
      }
      return points;
    }
    
    function getIntegrationLine(typeData, fromType, toType) {
      const fromX = getPointX(parseInt(fromType));
      const fromY = getPointY(parseInt(fromType));
      const toX = getPointX(toType);
      const toY = getPointY(toType);
      return `<path d="M ${fromX} ${fromY} Q 100 100 ${toX} ${toY}" stroke="url(#integGrad)" stroke-width="2" fill="none" stroke-dasharray="5,3" />`;
    }
    
    function getDissociationLine(typeData, fromType, toType) {
      const fromX = getPointX(parseInt(fromType));
      const fromY = getPointY(parseInt(fromType));
      const toX = getPointX(toType);
      const toY = getPointY(toType);
      return `<path d="M ${fromX} ${fromY} Q 100 100 ${toX} ${toY}" stroke="url(#dissoGrad)" stroke-width="2" fill="none" />`;
    }

    // 插入到最前面
    const panelScroll = $('.panel-scroll');
    if (panelScroll && !$('#personality-display')) {
      panelScroll.insertBefore(personalityEl, panelScroll.firstChild);
    }

    // 绑定重新测试按钮
    setTimeout(() => {
      const btn = $('#re-test-btn');
      if (btn) {
        btn.onclick = () => {
          localStorage.removeItem('mirror_personality');
          location.reload();
        };
      }
    }, 100);

    // 主目标
    if (desire) {
      $('#desire-current').textContent = '我想成为：' + desire;
    } else {
      $('#desire-current').textContent = '尚未设定 —— 选一个下面的方向或自己写';
    }

    // 预设
    const grid = $('#preset-grid');
    grid.innerHTML = '';
    DESIRE_PRESETS.forEach(p => {
      const el = document.createElement('button');
      el.className = 'preset-item' + (p === desire ? ' selected' : '');
      el.textContent = p;
      el.onclick = () => {
        setDesire(p);
        renderProfile();
      };
      grid.appendChild(el);
    });

    // 统计
    const total = entries.length;
    let emotionCount = 0;
    const emoMap = {};
    const traitMap = {};
    for (const e of entries) {
      if (e.emotions) for (const em of e.emotions) { emoMap[em.label] = (emoMap[em.label] || 0) + em.count; emotionCount += em.count; }
      if (e.patterns) for (const pa of e.patterns) traitMap[pa.trait] = (traitMap[pa.trait] || 0) + pa.count;
    }

    const topEmo = Object.entries(emoMap).sort((a, b) => b[1] - a[1])[0];

    $('#stats-strip').innerHTML =
      '<div class="stat-block"><div class="stat-num">' + total + '</div><div class="stat-label">记录次数</div></div>' +
      '<div class="stat-block"><div class="stat-num">' + (topEmo ? topEmo[0].split('/')[0] : '—') + '</div><div class="stat-label">常出现情绪</div></div>' +
      '<div class="stat-block"><div class="stat-num">' + (desire ? '已设' : '未设') + '</div><div class="stat-label">主目标</div></div>';

    // trait 条
    const traits = Object.entries(traitMap).sort((a, b) => b[1] - a[1]);
    const container = $('#traits-list');
    if (traits.length === 0) {
      container.innerHTML = '<div class="empty">还没有足够记录形成画像。至少再记录 1-2 次试试～</div>';
    } else {
      const max = traits[0][1];
      container.innerHTML = traits.map(([name, c]) => {
        const pct = Math.round((c / max) * 100);
        return '<div class="trait-row"><div class="trait-name">' + name + '</div>' +
          '<div class="trait-bar"><div class="trait-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="trait-count">' + c + '</div></div>';
      }).join('');
    }

    // 主题
    const themeMap = {};
    for (const e of entries) {
      if (e.themes) for (const t of e.themes) themeMap[t.label] = (themeMap[t.label] || 0) + t.count;
    }
    const themeList = Object.entries(themeMap).sort((a, b) => b[1] - a[1]);
    $('#theme-cloud').innerHTML = themeList.length
      ? themeList.map(([n, c]) => '<span class="theme-chip">' + n + ' × ' + c + '</span>').join('')
      : '<div class="empty">还没有识别到反复出现的主题。</div>';

    // 历史（可点击回到今日 Tab）
    const hl = $('#history-list');
    if (entries.length === 0) {
      hl.innerHTML = '<div class="empty">暂无记录。</div>';
    } else {
      hl.innerHTML = '';
      const reversed = entries.slice().reverse();
      reversed.forEach((e, idx) => {
        const div = document.createElement('div');
        div.className = 'history-entry';
        div.innerHTML = '<div class="h-date">' + e.friendly_date + ' · ' + (e.time || '') + '</div>' +
          '<div class="h-preview">' + escapeHtml(e.text.slice(0, 80)) + '...</div>';
        div.onclick = () => {
          $('#free-input').value = e.text;
          switchTab('today');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        hl.appendChild(div);
      });
    }

    // 清空
    $('#clear-all').onclick = () => {
      if (confirm('确认清空全部记录？此操作无法撤销。')) {
        saveEntries([]);
        renderProfile();
      }
    };

    // 保存自定义目标
    $('#save-custom-desire').onclick = () => {
      const val = $('#custom-desire-input').value.trim();
      if (!val) return;
      setDesire(val);
      // 同时写入通用建议字典
      if (!DESIRE_ACTION_ADVICE[val]) {
        DESIRE_ACTION_ADVICE[val] = GENERIC_ACTION_ADVICE.slice();
      }
      renderProfile();
      $('#custom-desire-input').value = '';
    };
  }

  /* =========================================================
   *  成长周报
   *  按每 7 天自动聚合一次，生成摘要
   * ========================================================= */
  function buildWeeklyReports() {
    const entries = loadEntries();
    if (entries.length === 0) return [];

    // 按日期聚合到周
    const byWeek = {};
    for (const e of entries) {
      // 简化：用 'YYYY-MM-DD' 取最近 7 天为一组
      const d = new Date(e.date);
      const weekKey = getWeekKey(d);
      if (!byWeek[weekKey]) byWeek[weekKey] = { entries: [], range: getWeekRange(d) };
      byWeek[weekKey].entries.push(e);
    }

    const weeks = Object.keys(byWeek).sort().reverse();
    return weeks.map(wk => {
      const group = byWeek[wk];
      const list = group.entries;
      const emoMap = {}, traitMap = {}, themeMap = {};
      for (const e of list) {
        if (e.emotions) for (const em of e.emotions) emoMap[em.label] = (emoMap[em.label] || 0) + em.count;
        if (e.patterns) for (const pa of e.patterns) traitMap[pa.trait] = (traitMap[pa.trait] || 0) + pa.count;
        if (e.themes) for (const t of e.themes) themeMap[t.label] = (themeMap[t.label] || 0) + t.count;
      }
      const topEmo = Object.entries(emoMap).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
      const topTraits = Object.entries(traitMap).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);
      const topThemes = Object.entries(themeMap).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);
      return {
        range: group.range,
        count: list.length,
        topEmo, topTraits, topThemes,
        desire: list[list.length - 1].desire || ''
      };
    });
  }

  function getWeekKey(d) {
    // 取那周的周一作为 key
    const day = d.getDay() || 7;
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day - 1));
    return monday.toISOString().slice(0, 10);
  }

  function getWeekRange(d) {
    const day = d.getDay() || 7;
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = dt => (dt.getMonth() + 1) + ' 月 ' + dt.getDate() + ' 日';
    return fmt(monday) + ' — ' + fmt(sunday);
  }

  function renderReports() {
    const reports = buildWeeklyReports();
    const container = $('#weekly-reports');
    if (reports.length === 0) {
      container.innerHTML = '<div class="empty">还没有记录可以生成周报。写几条记录再来看看～</div>';
      return;
    }

    container.innerHTML = reports.map((r, i) => {
      let html = '<div class="weekly-card">';
      html += '<span class="week-tag">第 ' + (reports.length - i) + ' 周 · ' + r.range + '</span>';
      html += '<h3>这周，你照了 ' + r.count + ' 次镜子。</h3>';

      if (r.topEmo.length) html += '<p>最常出现的情绪是：<strong>' + r.topEmo.join('、') + '</strong>。</p>';
      if (r.topThemes.length) html += '<p>你在 <strong>' + r.topThemes.join(' / ') + '</strong> 这几个领域花了最多心力。</p>';
      if (r.topTraits.length) html += '<p>反复出现的倾向是：<strong>' + r.topTraits.join('、') + '</strong>。</p>';

      html += '<div class="weekly-stats">';
      html += '<div class="weekly-stat"><div class="num">' + r.count + '</div><div class="lbl">记录次数</div></div>';
      html += '<div class="weekly-stat"><div class="num">' + r.topEmo.length + '</div><div class="lbl">情绪类别</div></div>';
      html += '<div class="weekly-stat"><div class="num">' + r.topTraits.length + '</div><div class="lbl">被识别模式</div></div>';
      html += '<div class="weekly-stat"><div class="num">' + r.topThemes.length + '</div><div class="lbl">主题领域</div></div>';
      html += '</div>';

      if (r.desire) {
        html += '<p>你这周的主目标是「<strong>' + escapeHtml(r.desire) + '</strong>」。</p>';
      }

      // 温和结尾 + 一个下周小练习
      html += '<p style="color:var(--ink-2);font-size:13px;">你不必每一周都更好。只要每一周都更看清一点自己，就足够了。</p>';
      html += '</div>';
      return html;
    }).join('');
  }

  /* =========================================================
   *  情绪趋势
   * ========================================================= */
  function renderTrend() {
    const entries = loadEntries();

    // 聚合各种情绪的总次数
    const emoMap = {};
    for (const e of entries) {
      if (e.emotions) for (const em of e.emotions) emoMap[em.label] = (emoMap[em.label] || 0) + em.count;
    }
    const emoList = Object.entries(emoMap).sort((a, b) => b[1] - a[1]);

    const chart = $('#trend-chart');
    if (emoList.length === 0) {
      chart.innerHTML = '<div class="empty">还没有情绪数据。先写一条记录～</div>';
    } else {
      const max = emoList[0][1];
      chart.innerHTML = emoList.map(([label, count]) => {
        const pct = Math.round((count / max) * 100);
        return '<div class="trend-row"><div class="trend-label">' + label + '</div>' +
          '<div class="trend-bar"><div class="trend-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="trend-num">' + count + '</div></div>';
      }).join('');
    }

    // 时间线
    const timeline = $('#timeline');
    if (entries.length === 0) {
      timeline.innerHTML = '<div class="empty">暂无时间线。</div>';
    } else {
      timeline.innerHTML = '';
      const reversed = entries.slice().reverse().slice(0, 20);
      reversed.forEach(e => {
        const tags = (e.emotions || []).slice(0, 3).map(em => '<span class="tl-emotion">' + em.label + '</span>').join('');
        const div = document.createElement('div');
        div.className = 'tl-entry';
        div.innerHTML = '<div class="tl-date">' + e.friendly_date + '</div>' +
          '<div class="tl-body">' + escapeHtml(e.text.slice(0, 60)) + '...' +
          '<div class="tl-emotions">' + tags + '</div></div>';
        timeline.appendChild(div);
      });
    }
  }

  /* =========================================================
   *  用户反馈（准/有一点准/不太准）
   * ========================================================= */
  function bindFeedback() {
    document.querySelectorAll('.fb-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.fb-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const type = btn.dataset.fb;
        let msg = '';
        if (type === 'accurate') msg = '谢谢你的反馈。镜子也在慢慢熟悉你～';
        if (type === 'somewhat') msg = '收到。每一次「有一点准」都是让镜子更靠近你的一步。';
        if (type === 'off') msg = '抱歉这次不太对。这是一个很有价值的信号——我会调整之后的分析方向。';
        $('#fb-result').textContent = msg;
      };
    });
  }

  /* =========================================================
   *  主题切换（白天 / 夜晚）
   * ========================================================= */
  function applyTheme(theme) {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    localStorage.setItem('mirror_theme', theme);

    const icon = theme === 'night' ? '☾' : '☀';
    const label = theme === 'night' ? '夜晚' : '白天';
    document.querySelectorAll('[data-theme-switch]').forEach(btn => {
      const iconEl = btn.querySelector('.theme-icon');
      const labelEl = btn.querySelector('span:not(.theme-icon)') || btn.querySelectorAll('span')[1];
      if (iconEl) iconEl.textContent = icon;
      if (labelEl) labelEl.textContent = label;
    });
  }

  function initTheme() {
    let saved = localStorage.getItem('mirror_theme');
    if (!saved) {
      saved = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'night' : 'day';
    }
    applyTheme(saved);

    document.querySelectorAll('[data-theme-switch]').forEach(btn => {
      btn.onclick = () => {
        const current = document.documentElement.getAttribute('data-theme') || 'day';
        applyTheme(current === 'night' ? 'day' : 'night');
      };
    });
  }

  /* =========================================================
   *  启动（检查人格类型）
   * ========================================================= */
  /* =========================================================
   *  设置面板初始化
   * ========================================================= */
  function initSettingsPanel() {
    const settingsBtn = $('#settings-btn');
    const settingsPanel = $('#settings-panel');
    const apiKeyInput = $('#api-key-input');
    const analysisMode = $('#analysis-mode');
    const platformSelect = $('#ai-platform');
    const modelSelect = $('#ai-model');
    const aiSettings = $('#ai-settings');
    const saveBtn = $('#save-settings-btn');
    const statusEl = $('#settings-status');
    const apikeyHint = $('#apikey-hint');

    if (!settingsBtn || !settingsPanel) return;

    // 加载已保存的设置
    const savedKey = loadApiKey();
    const savedMode = loadAnalysisMode();
    const savedPlatform = loadAIPlatform();
    const savedModel = loadAIModel();
    if (apiKeyInput) apiKeyInput.value = savedKey;
    if (analysisMode) analysisMode.value = savedMode;

    // 填充模型列表
    function updateModels() {
      const pid = platformSelect ? platformSelect.value : 'deepseek';
      const platform = AI_PLATFORMS[pid];
      if (!platform || !modelSelect) return;
      modelSelect.innerHTML = '';
      platform.models.forEach((m, i) => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name;
        if (m.id === savedModel || (i === 0 && !savedModel)) opt.selected = true;
        modelSelect.appendChild(opt);
      });
      // 更新 API Key placeholder 和提示
      if (apiKeyInput) apiKeyInput.placeholder = platform.placeholder;
      if (apikeyHint) apikeyHint.textContent = platform.hint;
    }

    // AI 设置区域显示/隐藏
    function updateAISettings() {
      if (aiSettings) {
        aiSettings.hidden = analysisMode.value !== 'ai';
      }
      if (analysisMode.value === 'ai') {
        if (platformSelect) platformSelect.value = savedPlatform;
        updateModels();
      }
    }

    if (analysisMode) analysisMode.onchange = updateAISettings;
    if (platformSelect) platformSelect.onchange = () => {
      updateModels();
      // 切换平台时清空 API Key
      if (apiKeyInput) apiKeyInput.value = '';
    };

    updateAISettings();

    // 点击设置按钮展开/收起面板
    settingsBtn.onclick = () => {
      const isHidden = settingsPanel.hidden;
      settingsPanel.hidden = !isHidden;
      settingsBtn.classList.toggle('active', isHidden);
    };

    // 保存设置
    if (saveBtn) {
      saveBtn.onclick = () => {
        const key = apiKeyInput ? apiKeyInput.value.trim() : '';
        const mode = analysisMode ? analysisMode.value : 'local';
        const platform = platformSelect ? platformSelect.value : 'deepseek';
        const model = modelSelect ? modelSelect.value : '';
        saveAnalysisMode(mode);
        saveAIPlatform(platform);
        saveAIModel(model);
        saveApiKey(key);
        if (statusEl) {
          statusEl.textContent = '✓ 设置已保存';
          statusEl.style.color = 'var(--accent-strong)';
          setTimeout(() => { statusEl.textContent = ''; }, 2000);
        }
        settingsPanel.hidden = true;
        settingsBtn.classList.remove('active');
      };
    }
  }

  function init() {
    // 主题（先于其他，确保样式正确）
    initTheme();

    // 检查是否已设置人格类型
    if (!hasPersonality()) {
      showPersonalitySelector();
      return;
    }

    // 已设置人格类型，正常启动
    // 顶栏日期
    const dateEl = $('#top-date');
    if (dateEl) dateEl.textContent = friendlyDate();

    // 显示人格类型按钮
    const personality = getPersonality();
    const typeData = ENNEAGRAM_TYPES[personality];
    const personBtn = $('#personality-btn');
    const personBtnMirror = $('#personality-btn-mirror');
    if (personBtn && typeData) {
      personBtn.textContent = typeData.name;
      personBtn.style.display = 'block';
      personBtn.onclick = () => {
        localStorage.removeItem('mirror_personality');
        location.reload();
      };
    }
    if (personBtnMirror && typeData) {
      personBtnMirror.textContent = typeData.name;
      personBtnMirror.style.display = 'block';
      personBtnMirror.onclick = () => {
        localStorage.removeItem('mirror_personality');
        location.reload();
      };
    }

    // 设置面板
    initSettingsPanel();

    // Tab
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.onclick = () => switchTab(btn.dataset.tab);
    });

    // 分析
    $('#analyze-btn').onclick = onAnalyze;

    // 反馈按钮
    bindFeedback();

    // 首屏：如果还没写，analysis-area 隐藏
    $('#analysis-area').hidden = true;
    $('#safety-panel').hidden = true;
    $('#echo-panel').hidden = true;

    // save-hint 默认隐藏
    $('#save-hint').hidden = true;

    // 回车（Ctrl/Cmd + Enter）触发
    $('#free-input').addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') onAnalyze();
    });

    // 渲染初始页面
    renderProfile();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
