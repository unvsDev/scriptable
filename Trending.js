// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: chart-line;
const DATA_URL = "https://search.namu.wiki/api/ranking"

let fm = FileManager.local()
const CACHE_PATH = fm.documentsDirectory() + "/namuWikiTrending.txt"

let cache = {}
if(fm.fileExists(CACHE_PATH)){ cache = eval(fm.readString(CACHE_PATH)) }

try{
  cache = await new Request(DATA_URL).loadString()
  await fm.writeString(CACHE_PATH, cache)
  cache = eval(cache)
} catch(e){
  if(!fm.fileExists(CACHE_PATH)){
    throw new Error("네트워크 오류. 데이터 갱신에 실패했습니다.")
  }
}

if(args.queryParameters.launch == "appui"){
  let table = new UITable()
  table.showSeparators = true
  
  let title = new UITableRow()
  title.isHeader = true
  title.addText("인기 급상승")
  table.addRow(title)
  
  for(i in cache){
    let row = new UITableRow()
    row.dismissOnSelect = false
    row.addText(cache[i])
    
    row.onSelect = (index) => {
      Safari.openInApp("https://namu.wiki/w/" + encodeURI(cache[index-1]))
    }
    
    table.addRow(row)
  }
  
  await table.present()
  return 0
}

let widget = new ListWidget()

for(let i = 0; i < (config.widgetFamily == "large" ? 10 : 4); i++){
  let text = widget.addText(cache[i])
  text.font = Font.blackSystemFont(20)
  text.textColor = new Color("215545")
  text.lineLimit = 1
  
  if(config.widgetFamily == "large"){ widget.addSpacer(4) }
}

let stack1 = widget.addStack()
stack1.centerAlignContent()

let baseText = stack1.addText("인기 급상승")
baseText.font = Font.blackSystemFont(20)
baseText.textColor = new Color("cccccc")

let symbol = stack1.addImage(SFSymbol.named("chart.line.uptrend.xyaxis").image)
symbol.imageSize = new Size(22, 22)
symbol.tintColor = new Color("cccccc")

widget.url = "https://namu.wiki/w/" + encodeURI(cache[0])

let simpleGradient = new LinearGradient()
simpleGradient.colors = [new Color("030806"), new Color("0d221b")]
simpleGradient.locations = [0, 1]
simpleGradient.startPoint = new Point(0, 0)
simpleGradient.endPoint = new Point(1, 1)

widget.backgroundGradient = simpleGradient

widget.url = `scriptable:///run?scriptName=${Script.name()}&launch=appui`
widget.refreshAfterDate = new Date(Date.now() + 1000 * 300)

Script.setWidget(widget)
if(config.runsInApp){ widget.presentSmall() }