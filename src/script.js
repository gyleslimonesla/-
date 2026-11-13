/* FROM HAIKU TO MYTHOS — master script: timeline, words, narration.
   One source of truth for picture, subtitles, captions and audio ducking. */
(function (G) {
  'use strict';
  var S = {};
  S.DUR = 150;

  // Seven acts (seconds on the master clock).
  S.ACTS = [
    { id: 'prologue', t0: 0,   t1: 12 },
    { id: 'haiku',    t0: 12,  t1: 38,  num: 'I',   en: 'HAIKU',  zh: '俳句',       tag: 'A WORLD IN A MOMENT' },
    { id: 'sonnet',   t0: 38,  t1: 66,  num: 'II',  en: 'SONNET', zh: '十四行诗',   tag: 'EMOTION IN FORM' },
    { id: 'opus',     t0: 66,  t1: 94,  num: 'III', en: 'OPUS',   zh: '作品',       tag: 'THE ART OF CREATION' },
    { id: 'fable',    t0: 94,  t1: 119, num: 'IV',  en: 'FABLE',  zh: '寓言与故事', tag: 'THAT WHICH IS TOLD' },
    { id: 'mythos',   t0: 119, t1: 142, num: 'V',   en: 'MYTHOS', zh: '神话',       tag: 'THE STORIES WE LIVE BY' },
    { id: 'coda',     t0: 142, t1: 150 }
  ];

  // Narration (female voice, Mandarin). Each cue: [start, end, text].
  // "\n" marks the subtitle line break. Subtitles are drawn from this same table.
  S.NARRATION = [
    [7.6,   11.0,  '每一个名字，都曾是一首诗。'],
    [14.6,  19.4,  '俳句，来自日本。\n五、七、五，共十七个音。'],
    [20.4,  25.6,  '用最少的语言，留住一个瞬间。'],
    [26.6,  31.6,  '一片叶落，一声水响，\n世界就在其中。'],
    [40.4,  46.2,  '十四行诗，名字来自意大利语 _sonetto_，\n意思是“小小的歌”。'],
    [47.6,  52.6,  '十四行，不多一行，也不少一行。'],
    [53.8,  59.4,  '情感在格律之中，被韵律雕刻成形。'],
    [68.4,  73.4,  '_Opus_，是拉丁语里的“作品”。'],
    [74.6,  81.0,  '音乐家用它为乐曲编号；\n毕生的杰作，被称为 _magnum opus_。'],
    [82.4,  87.8,  '当结构足够宏大，创造便有了殿堂。'],
    [96.2,  101.6, '_Fable_，源自拉丁语 _fabula_，\n意思是“被讲述的事”。'],
    [102.8, 108.0, '狐狸开口说话，智慧便藏进了故事。'],
    [109.0, 113.4, '故事，从这里开始呼吸。'],
    [121.2, 126.6, '_Mythos_，来自希腊语 μῦθος：\n言说、故事，乃至神话。'],
    [127.8, 133.6, '当故事被一代代人讲述，\n它就成为我们理解世界的方式。'],
    [134.6, 138.6, '寓言与神话，本是同一个故事。'],
    [143.4, 147.6, '语言为智慧命名，\n故事让名字拥有世界。']
  ];

  // Captions. kind 'ety' = attested etymology; kind 'fact' = Anthropic product fact.
  // (The narration above is the film's own poetic voice; it is never labelled as fact.)
  S.CAPTIONS = [
    [16.4,  24.4,  'ety',  '日语 俳句 _haiku_ · 五—七—五，凡十七音'],
    [25.4,  32.4,  'fact', 'Claude Haiku · 家族中最轻快的模型'],
    [42.0,  50.0,  'ety',  '意大利语 _sonetto_ ·“小歌”· 源自拉丁语 _sonus_（声音）'],
    [51.0,  59.6,  'fact', 'Claude Sonnet · 兼顾智能与速度的均衡模型'],
    [70.0,  78.0,  'ety',  '拉丁语 _opus_ ·“作品、劳作”· 复数 _opera_'],
    [79.0,  87.6,  'fact', 'Claude Opus · 面向深度与复杂工作的模型'],
    [97.6,  105.2, 'ety',  '拉丁语 _fābula_ ·“被讲述的事”· 源自 _fārī_（言说）'],
    [106.2, 113.6, 'fact', 'Claude Fable 5.2 · 目前公开可用的最智能模型'],
    [122.4, 132.4, 'ety',  '希腊语 μῦθος _mŷthos_ · 言说 · 故事 · 神话'],
    [133.8, 140.4, 'fact', 'Mythos 5.2 与 Fable 5.2 共享同一底层模型\n区别在于安全防护与访问条件']
  ];
  S.LABELS = { ety: ['ETYMOLOGY', '词源'], fact: ['ANTHROPIC', '产品事实'] };

  S.TITLE = { l1: 'FROM', l2: 'HAIKU', l3: 'TO', l4: 'MYTHOS', zh: '从俳句到神话', sub: 'The Poetry Behind Claude’s Names' };
  S.CODA = {
    names: ['HAIKU', 'SONNET', 'OPUS', 'FABLE', 'MYTHOS'],
    line: ['语言为智慧命名，', '故事让名字拥有世界。'],
    colophon: ['词源据通行辞书 · 产品事实据 Anthropic 公开信息', '诗意联想为本片创作，并非官方命名释义']
  };

  // Player interface strings (kept here so the font subset covers them).
  S.UI = {
    loading: '正在装帧', start: '开始放映', hint: '建议佩戴耳机 · 竖屏观看', replay: '重新放映', quality: '画质', q: ['高', '中', '低'],
    narr: '导入旁白音轨', narrOk: '旁白已载入', narrNone: '旁白：字幕版', auto: '已自动调整画质', err: '载入失败，请刷新重试', tune: '正在调音'
  };

  // Every CJK/Greek glyph the film draws (used by tools/build-fonts.py for subsetting).
  S.allText = function () {
    var s = '';
    S.NARRATION.forEach(function (c) { s += c[2]; });
    S.CAPTIONS.forEach(function (c) { s += c[3]; });
    S.ACTS.forEach(function (a) { s += (a.zh || ''); });
    for (var k in S.UI) s += [].concat(S.UI[k]).join('');
    s += S.TITLE.zh + S.CODA.line.join('') + S.CODA.colophon.join('') + S.LABELS.ety[1] + S.LABELS.fact[1];
    return s;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = S;
  G.SCRIPT = S;
})(typeof window !== 'undefined' ? window : globalThis);
