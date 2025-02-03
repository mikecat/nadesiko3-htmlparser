// nadesiko3-htmlparser.js
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'

const ERR_PARSER = '『HTML_URL開』または『HTMLパース』を実行してHTMLパーサを利用可能にしてください。'
// モジュールローカル
const htmlObj = {}

// 文字列からDOMを取得して、エラーチェックもする
function getDom (query) {
  if (query === htmlObj.$) { return query }
  if (!htmlObj.$) throw new Error(ERR_PARSER)
  if (typeof query !== 'object') {
    try {
      const dom = htmlObj.$(query)
      if (!dom) throw new Error(`空のクエリ『${query}』が指定されました。`)
      return dom
    } catch (e) {
      throw new Error(`クエリ『${query}』の取得に失敗。` + e.message)
    }
  }
  if (!query) throw new Error('空のDOMオブジェクトが指定されました。')
  return htmlObj.$(query)
}

export default {
  '初期化': {
    type: 'func',
    josi: [],
    fn: function (sys) {
      sys.__htmlparser = null
      htmlObj.$ = null
    }
  },

  // @HTMLパーサ(コンソール)
  'HTML_URL開': { // @任意のURLを開いてパースする。 // @HTML_URLひらく
    type: 'func',
    josi: [['を']],
    asyncFn: true,
    fn: function (url, sys) {
      return new Promise((resolve, reject) => {
        fetch(url)
        .then(res => res.text())
        .then(text => {
          const dom = cheerio.load(text)
          sys.__htmlparser = dom
          htmlObj.$ = dom
          resolve(dom)
        })
        .catch(err => reject(err))
      })
    }
  },
  'HTMLパース': { // @任意のHTML文字列をパースする。 // @HTMLぱーす
    type: 'func',
    josi: [['を']],
    fn: function (html, sys) {
      const $ = cheerio.load(html)
      sys.__htmlparser = $
      htmlObj.$ = $
      return $
    }
  },
  'DOM検索': { // @DOMからクエリQを利用して合致するものを検索して配列で返す // @DOMちゅうしゅつ
    type: 'func',
    josi: [['から', 'の'], ['を']],
    fn: function (dom, q, sys) {
      // root
      if (dom === htmlObj.$) {
        return dom(q).toArray()
      }
      // not root
      const $ = getDom(dom)
      const r = $.find(q).toArray()
      return r
    }
  },
  'DOM要素取得': { // @パース済みHTMLからクエリQに該当するDOMを取得して返す // @DOMようそしゅとく
    type: 'func',
    josi: [['を', 'の', 'から']],
    fn: function (q, sys) {
      return getDom(q)
    }
  },
  'DOM子要素全取得': { // @DOMの子要素を全部取得する // @DOMこようそぜんしゅとく
    type: 'func',
    josi: [['の', 'から']],
    fn: function (dom, sys) {
      const o = getDom(dom)
      return o.children()
    }
  },
  'DOM親要素取得': { // @DOMの親要素を取得する // @DOMおやようそしゅとく
    type: 'func',
    josi: [['を', 'の', 'から']],
    fn: function (q, sys) {
      return getDom(q).parent()
    }
  },
  'DOM次要素取得': { // @DOMの親要素を取得する // @DOMおやようそしゅとく
    type: 'func',
    josi: [['を', 'の', 'から']],
    fn: function (q, sys) {
      return getDom(q).next()
    }
  },
  'DOM抽出': { // @DOMからクエリQを利用して合致するものを抽出して配列で返す // @DOMちゅうしゅつ
    type: 'func',
    josi: [['から', 'の'], ['を']],
    fn: function (dom, q, sys) {
      return sys.__exec('DOM検索', [dom, q, sys])
    }
  },
  '属性取得': { // @DOMの属性Kを取得する // @ぞくせいしゅとく
    type: 'func',
    josi: [['から', 'の'], ['を']],
    fn: function (dom, k, sys) {
      const o = getDom(dom)
      return o.attr(k)
    }
  },
  'テキスト取得': { // @DOMのテキストを取得する // @てきすとしゅとく
    type: 'func',
    josi: [['から', 'の']],
    fn: function (dom, sys) {
      const o = getDom(dom)
      if ('text' in o) {
        const s = o.text()
        return s
      }
      return ''
    }
  },
  'HTML取得': { // @DOMのHTMLを取得する // @HTMLしゅとく
    type: 'func',
    josi: [['から', 'の']],
    fn: function (dom, sys) {
      const o = getDom(dom)
      return o.html()
    }
  },
  'HTML設定': { // @DOMにSを設定する // @HTMLせってい
    type: 'func',
    josi: [['に', 'へ'], ['を']],
    fn: function (dom, s, sys) {
      const o = getDom(dom)
      return o.html(s)
    }
  },
  'プロパティ取得': { // @DOMのプロパティPROPを取得する // @ぷろぱてぃしゅとく
    type: 'func',
    josi: [['から', 'の'], ['を']],
    fn: function (dom, prop, sys) {
      const o = getDom(dom)
      return o.prop(prop)
    }
  },
  '値取得': { // @DOMの値を取得する // @あたいしゅとく
    type: 'func',
    josi: [['から', 'の']],
    fn: function (dom, sys) {
      const o = getDom(dom)
      return o.val()
    }
  },
  '値設定': { // @DOMの値vを設定する // @あたいせってい
    type: 'func',
    josi: [['に', 'へ'], ['を']],
    fn: function (dom, v, sys) {
      const o = getDom(dom)
      return o.val(v)
    }
  },
  'スタイル取得': { // @DOMのスタイルKを取得する // @すたいるしゅとく
    type: 'func',
    josi: [['から', 'の'], ['を']],
    fn: function (dom, k, sys) {
      const o = getDom(dom)
      return o.css(k)
    }
  },
  'データ取得': { // @DOMのデータkを取得する // @でーたしゅとく
    type: 'func',
    josi: [['から', 'の'], ['を']],
    fn: function (dom, k, sys) {
      const o = getDom(dom)
      return o.data(k)
    }
  },
  'DOM配列変換': { // @DOMを配列に変換する // @DOMはいれつへんかん
    type: 'func',
    josi: [['から', 'を']],
    fn: function (dom, sys) {
      const o = getDom(dom)
      return o.toArray()
    }
  },
  'タグ名取得': { // @DOMのタグ名を取得する // @たぐめいしゅとく
    type: 'func',
    josi: [['から', 'の']],
    fn: function (dom, sys) {
      const o = getDom(dom)
      const p = o.get(0)
      if (!p) return ''
      if (p.tagName) return p.tagName
      return ''
    }
  }
}
