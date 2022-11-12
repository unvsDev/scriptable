// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: dot-circle;
// Melon Chart - by unvsDev
// Melon Top100 Song Information

const GIST_ID = await Keychain.get("service-gistid-melc")
const DATA_URL = "https://gist.githubusercontent.com/" + GIST_ID + "/raw/melonChart.json"

let fm = FileManager.local()
const CACHE_PATH = fm.documentsDirectory() + "/melonChartCache.json"
const IMG_PATH = [
  fm.documentsDirectory() + "/melonImg1.jpg",
  fm.documentsDirectory() + "/melonImg2.jpg",
  fm.documentsDirectory() + "/melonImg3.jpg"]

let cache = {}
if(fm.fileExists(CACHE_PATH)){ cache = JSON.parse(fm.readString(CACHE_PATH)) }

try{
  cache = await new Request(DATA_URL).loadJSON()
  await fm.writeString(CACHE_PATH, JSON.stringify(cache))
} catch(e){
  if(cache.chartTime == undefined){
    throw new Error("네트워크 오류. 데이터 갱신에 실패했습니다.")
  }
}

let img1, img2, img3
try{
  if(config.widgetFamily != "accessoryRectangular"){
    img1 = await new Request(cache[1].cover).loadImage()
    await fm.writeImage(IMG_PATH[0], img1)
  }
  
  if(config.widgetFamily == "large"){
    img2 = await new Request(cache[2].cover).loadImage()
    img3 = await new Request(cache[3].cover).loadImage()
    await fm.writeImage(IMG_PATH[1], img2)
    await fm.writeImage(IMG_PATH[2], img3)
  }
  
} catch(e){
  if(fm.fileExists(IMG_PATH[0])){ img1 = fm.readImage(IMG_PATH[0]) }
  if(fm.fileExists(IMG_PATH[1])){ img2 = fm.readImage(IMG_PATH[1]) }
  if(fm.fileExists(IMG_PATH[2])){ img3 = fm.readImage(IMG_PATH[2]) }
}

let df = new DateFormatter()
df.dateFormat = "yyyyMMddHHmm"

let df2 = new DateFormatter()
df2.dateFormat = "M월 d일 HH시 기준"

let widget = new ListWidget()

if(config.runsInApp || config.widgetFamily == "medium"){
  let stack1 = widget.addStack()
  stack1.centerAlignContent()
  
  let baseText1 = stack1.addText("Top 100 ")
  baseText1.font = Font.boldSystemFont(15)
  baseText1.textColor = new Color("5EC851")
  
  let baseText2 = stack1.addText(df2.string(df.date(cache.chartTime)))
  baseText2.font = Font.systemFont(14)
  baseText2.textColor = new Color("ffffff")
  baseText2.textOpacity = 0.8
  
  stack1.addSpacer()
  widget.addSpacer()
  
  let hStack = widget.addStack()
  hStack.centerAlignContent()
  
  let vStack = hStack.addStack()
  vStack.layoutVertically()
  
  let hSpacer = vStack.addStack()
  hSpacer.addSpacer()
  
  for(let i = 1; i < 6; i++){
    let stack = vStack.addStack()
    stack.centerAlignContent()
    stack.url = cache[i].link
    
    let indexText = stack.addText(i.toString())
    indexText.font = Font.boldMonospacedSystemFont(14)
    indexText.textColor = new Color("ffffff")
    
    let flagStack = stack.addStack()
    flagStack.size = new Size(24, 0)
    
    if(cache[i].flag == "순위 동일"){
      let flagText = flagStack.addText("-")
      flagText.font = Font.mediumMonospacedSystemFont(14)
      flagText.textColor = new Color("ffffff")
    } else {
      let temp = cache[i].flag.split("단계 ")
      let flagText = flagStack.addText((temp[1] == "상승" ? "↑" : "↓") + temp[0])
      flagText.font = Font.mediumMonospacedSystemFont(14)
      flagText.textColor = temp[1] == "상승" ? new Color("E64473") : new Color("69A1F8")
    }
    
    let titleText = stack.addText(cache[i].title)
    titleText.font = Font.systemFont(13)
    titleText.textColor = new Color("ffffff")
    titleText.lineLimit = 1
    
    if(i != 5){ vStack.addSpacer(3) }
  }
  
  let vStack2 = hStack.addStack()
  vStack2.layoutVertically()
  vStack2.setPadding(0, 8, 0, 0)
  
  vStack2.addSpacer()
  
  let image = vStack2.addImage(img1)
  image.imageSize = new Size(80, 80)
  image.cornerRadius = 5
  
  widget.url = "meloniphone://chart"
  widget.backgroundColor = new Color("121212")
    
} else if(config.widgetFamily == "small"){
  let stack1 = widget.addStack()
  
  let image = stack1.addImage(img1)
  image.imageSize = new Size(80, 80)
  image.cornerRadius = 5
  
  stack1.addSpacer()
  
  let baseText1 = stack1.addText("#1")
  baseText1.font = Font.boldMonospacedSystemFont(20)
  baseText1.textColor = new Color("ffffff")
  baseText1.textOpacity = 0.8
  
  widget.addSpacer()
  
  let titleText = widget.addText(cache[1].title)
  titleText.font = Font.boldSystemFont(13)
  titleText.lineLimit = 1
  titleText.textColor = new Color("5EC851")
  
  widget.addSpacer(2)
  
  let artistText = widget.addText(cache[1].artist)
  artistText.font = Font.systemFont(11)
  artistText.lineLimit = 1
  artistText.textColor = new Color("ffffff")
  
  widget.url = "meloniphone://home"
  widget.backgroundColor = new Color("121212")
  
} else if(config.widgetFamily == "large"){
  let stack1 = widget.addStack()
  stack1.centerAlignContent()
  
  let baseText1 = stack1.addText("Top 100 ")
  baseText1.font = Font.boldSystemFont(14)
  baseText1.textColor = new Color("5EC851")
  
  let baseText2 = stack1.addText(df2.string(df.date(cache.chartTime)))
  baseText2.font = Font.systemFont(13)
  baseText2.textColor = new Color("ffffff")
  baseText2.textOpacity = 0.8
  
  stack1.addSpacer()
  
  widget.addSpacer(7)
  
  for(let i = 1; i < 10; i++){
    let stack = widget.addStack()
    stack.centerAlignContent()
    stack.url = cache[i].link
    
    let indexText = stack.addText(i.toString())
    indexText.font = Font.boldMonospacedSystemFont(14)
    indexText.textColor = new Color("ffffff")
    
    let flagStack = stack.addStack()
    flagStack.size = new Size(24, 0)
    
    if(cache[i].flag == "순위 동일"){
      let flagText = flagStack.addText("-")
      flagText.font = Font.mediumMonospacedSystemFont(14)
      flagText.textColor = new Color("ffffff")
    } else {
      let temp = cache[i].flag.split("단계 ")
      let flagText = flagStack.addText((temp[1] == "상승" ? "↑" : "↓") + temp[0])
      flagText.font = Font.mediumMonospacedSystemFont(14)
      flagText.textColor = temp[1] == "상승" ? new Color("E64473") : new Color("69A1F8")
    }
    
    let titleText = stack.addText(cache[i].title)
    titleText.font = Font.systemFont(13)
    titleText.textColor = new Color("ffffff")
    titleText.lineLimit = 1
    
    let artistText = stack.addText(" • " + cache[i].artist)
    artistText.font = Font.systemFont(11)
    artistText.textColor = new Color("ffffff")
    artistText.textOpacity = 0.6
    artistText.lineLimit = 1
    
    if(i != 9){ widget.addSpacer(4) }
  }
  
  widget.addSpacer()
  
  let imgStack = widget.addStack()
  imgStack.backgroundColor = new Color("292929")
  imgStack.cornerRadius = 10
  imgStack.setPadding(6,6,6,6)
  
  let img = [img1, img2, img3]
  for(let i = 0; i < 3; i++){
    let image = imgStack.addImage(img[i])
    image.imageSize = new Size(83, 83)
    image.cornerRadius = 5
    image.url = cache[i+1].link
    
    if(i != 2){ imgStack.addSpacer()}
  }
  
  widget.url = "meloniphone://chart"
  widget.backgroundColor = new Color("121212")
  
} else if(config.widgetFamily == "accessoryRectangular"){
  for(let i = 1; i < 4; i++){
    let stack = widget.addStack()
    stack.centerAlignContent()
    
    let baseText = stack.addText(i + " ")
    baseText.font = Font.boldMonospacedSystemFont(11)
    baseText.textOpacity = 0.8
    
    let titleText = stack.addText(cache[i].title)
    titleText.lineLimit = 1
    stack.addSpacer()
  }
  
  widget.url = "meloniphone://chart"
  
}

widget.refreshAfterDate = new Date(Date.now() + 1000 * 300)

Script.setWidget(widget)
if(config.runsInApp){ widget.presentMedium() }