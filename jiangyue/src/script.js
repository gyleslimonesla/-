/* 《江月何年》— 文本与时间总表。画面、字幕、配乐让位都读这一张表。
   结构：一昼夜。从一个黄昏的月出，走到下一个黄昏的灯火；六首诗，跨五个世纪。 */
(function (G) {
  'use strict';
  var S = {};
  S.DUR = 180;
  S.TITLE = '江月何年';

  // 九段（秒）。seal = 十二时辰旧称。
  S.ACTS = {
    xu:     { t0: 0,   t1: 13 },
    jiang:  { t0: 13,  t1: 39,  seal: '黄昏', who: '唐　张若虚', work: '春江花月夜' },
    shan:   { t0: 39,  t1: 62,  seal: '人定', who: '唐　王维', work: '山居秋暝' },
    feng:   { t0: 62,  t1: 86,  seal: '夜半', who: '唐　张继', work: '枫桥夜泊' },
    baidi:  { t0: 86,  t1: 108, seal: '日出', who: '唐　李白', work: '早发白帝城' },
    xihu:   { t0: 108, t1: 131, seal: '日中', who: '北宋　苏轼', work: '饮湖上初晴后雨' },
    xia:    { t0: 131, t1: 139, seal: '日入', who: '唐　王勃', work: '滕王阁序' },
    yuan:   { t0: 139, t1: 165, seal: '黄昏', who: '南宋　辛弃疾', work: '青玉案　元夕' },
    ba:     { t0: 165, t1: 180 }
  };

  /* 屏上文字。kind: 'poem' 原诗（楷）| 'guide' 导语（本片自撰，宋）
     cols: 竖排，自右向左；全角空格为句内停顿。 */
  S.TEXT = [
    { id: 'g0',  kind: 'guide', t: [2.4, 7.2],     cols: ['一千三百年前', '有人在江边', '问了月亮一句话'] },

    { id: 'j0',  kind: 'guide', t: [15.8, 19.0],   cols: ['潮水把月亮', '托出了海面'] },
    { id: 'j1',  kind: 'poem',  t: [19.3, 27.6],   cols: ['春江潮水连海平', '海上明月共潮生'] },
    { id: 'j2',  kind: 'poem',  t: [28.6, 37.4],   cols: ['江畔何人初见月', '江月何年初照人'] },
    { id: 'j3',  kind: 'guide', t: [32.6, 37.4],   cols: ['这一问', '至今无人能答'] },

    { id: 's0',  kind: 'guide', t: [41.8, 45.4],   cols: ['雨停了', '山把声音还给泉水'] },
    { id: 's1',  kind: 'poem',  t: [45.8, 52.6],   cols: ['空山新雨后', '天气晚来秋'] },
    { id: 's2',  kind: 'poem',  t: [53.2, 60.6],   cols: ['明月松间照', '清泉石上流'] },

    { id: 'f0',  kind: 'guide', t: [64.8, 68.4],   cols: ['月亮落下去的时候', '有一个人没有睡'] },
    { id: 'f1',  kind: 'poem',  t: [68.8, 75.6],   cols: ['月落乌啼霜满天', '江枫渔火对愁眠'] },
    { id: 'f2',  kind: 'poem',  t: [76.2, 84.6],   cols: ['姑苏城外寒山寺', '夜半钟声到客船'] },
    { id: 'f3',  kind: 'guide', t: [80.8, 85.2],   cols: ['那一声钟', '响了一千二百年'] },

    { id: 'b0',  kind: 'guide', t: [88.6, 91.6],   cols: ['流放的路走到一半', '赦书到了'] },
    { id: 'b1',  kind: 'poem',  t: [91.9, 98.6],   cols: ['朝辞白帝彩云间', '千里江陵一日还'] },
    { id: 'b2',  kind: 'poem',  t: [99.2, 106.6],  cols: ['两岸猿声啼不住', '轻舟已过万重山'] },

    { id: 'x0',  kind: 'guide', t: [110.8, 113.4], cols: ['晴也好'] },
    { id: 'x1',  kind: 'poem',  t: [113.7, 120.2], cols: ['水光潋滟晴方好', '山色空蒙雨亦奇'] },
    { id: 'x2',  kind: 'guide', t: [120.4, 123.8], cols: ['雨也好'] },
    { id: 'x3',  kind: 'poem',  t: [123.8, 130.2], cols: ['欲把西湖比西子', '淡妆浓抹总相宜'] },

    { id: 'l1',  kind: 'poem',  t: [132.2, 138.4], cols: ['落霞与孤鹜齐飞', '秋水共长天一色'] },

    { id: 'y0',  kind: 'guide', t: [141.6, 144.5], cols: ['夜又来了', '这一次　人间自己点起星星'] },
    { id: 'y1',  kind: 'poem',  t: [144.8, 150.6], cols: ['东风夜放花千树', '更吹落　星如雨'] },
    { id: 'y2',  kind: 'poem',  t: [151.0, 155.8], cols: ['凤箫声动　玉壶光转', '一夜鱼龙舞'] },
    { id: 'y3',  kind: 'poem',  t: [157.4, 164.6], cols: ['众里寻他千百度', '蓦然回首', '那人却在', '灯火阑珊处'] },

    { id: 'e0',  kind: 'guide', t: [166.2, 171.0], cols: ['写诗的人　都已走远', '月亮　还是那一个'] },
    { id: 'e1',  kind: 'poem',  t: [171.4, 179.5], cols: ['江月何年初照人'] },
    { id: 'e2',  kind: 'guide', t: [174.6, 179.5], cols: ['今夜　照你'] }
  ];
  S.COLOPHON = ['一昼夜　六首诗', '诗文　张若虚　王维　张继　李白　苏轼　王勃　辛弃疾'];

  // 旁白 cue（若日后配音，逐句对应；播放器据此让位）
  S.NARRATION = S.TEXT.map(function (x) { return [x.t[0], x.t[1], x.cols.join('，').replace(/　/g, '，')]; });

  S.UI = {
    loading: '展卷', start: '开卷', hint: '宜静处　宜耳机', replay: '再读一遍', quality: '画质', q: ['高', '中', '低'],
    narr: '导入旁白音轨', narrOk: '旁白已载入', narrNone: '旁白：字幕版', auto: '已自动调整画质', err: '载入失败，请刷新重试', tune: '调弦'
  };

  S.allText = function () {
    var s = S.TITLE + S.COLOPHON.join('') + '0123456789:/ ·';
    S.TEXT.forEach(function (x) { s += x.cols.join(''); });
    for (var k in S.ACTS) { var a = S.ACTS[k]; s += (a.seal || '') + (a.who || '') + (a.work || ''); }
    for (var u in S.UI) s += [].concat(S.UI[u]).join('');
    return s;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = S;
  G.SCRIPT = S;
})(typeof window !== 'undefined' ? window : globalThis);
