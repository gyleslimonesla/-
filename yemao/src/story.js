/* story.js — 《夜是一只很大的猫》全文与分页。 */
(function (G) {
  'use strict';
  var S = {};
  S.TITLE = '夜是一只很大的猫';
  S.SUB = '一个可以点、可以摸的睡前故事';
  S.PAGES = [
    { id: 'cover', plate: 'village', cover: true },
    { id: 'out', plate: 'village', text: ['月亮已经三个晚上没有出来了。', '村里的人说，大概是丢了。', '小灯不信。她给灯笼添了油，一个人出了门。'], hint: '点一点画面，送她一程' },
    { id: 'heron', plate: 'heron', text: ['沼泽里站着一只很高很高的鹭，腿比树还长。', '“请问，您见过月亮吗？”', '“我只吃水里的星星。”鹭说，“月亮的事，去问背着山的那一位。”'], hint: '点一点水面' },
    { id: 'turtle', plate: 'turtle', text: ['背着山的那一位，是一只老龟。它走得很慢，一步要走一整夜。', '“月亮没有丢，”老龟说，“它只是闭上了。', '你往草原的尽头走，走到草变得又黑又暖的地方。”'], hint: '轻轻碰一下老龟' },
    { id: 'fur', plate: 'fur', text: ['草原的尽头，草果然又黑又暖。', '小灯走了很久才明白——这不是草。这是毛。', '地面在一起一伏。夜，是一只很大很大的猫。'], hint: '摸一摸它' },
    { id: 'closed', plate: 'eye', text: ['她顺着毛往上爬，爬到一道弯弯的、合着的缝跟前。', '“上回我睁开眼，”猫的声音像很远的雷，“底下的人说太亮了，吓人。他们关上了窗。', '那我就不看了。”'] },
    { id: 'open', plate: 'eye', text: ['小灯把灯笼举得高高的。', '“我不怕。我找了你三个晚上。”'], after: ['那道缝慢慢地、慢慢地睁开了。', '原来月亮，是夜的眼睛。', '它亮着的时候，是在看你。'], hint: '按住画面，替她把灯举高' },
    { id: 'home', plate: 'village', text: ['从那以后，小灯每晚睡前都对着窗外说：', '“晚安，大猫。”', '夜就眯一眯眼睛——', '人们管那叫月牙。'], hint: '点一点月亮，跟它说晚安', end: true }
  ];
  S.UI = { open: '翻开', loading: '正在点灯', end: '晚安', again: '再读一遍', sound: '声音', prev: '上一页', next: '下一页' };
  S.allText = function () {
    var s = S.TITLE + S.SUB + '0123456789/ ·';
    S.PAGES.forEach(function (p) { s += (p.text || []).join('') + (p.after || []).join('') + (p.hint || ''); });
    for (var k in S.UI) s += S.UI[k];
    return s;
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = S;
  G.STORY = S;
})(typeof window !== 'undefined' ? window : globalThis);
