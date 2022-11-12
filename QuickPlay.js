// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: play;
// Quick Play - developed by unvsDev
// Allow end-users to install scripts seamlessly

const SCRIPT_VERSION = "1.0"
let fm = FileManager.iCloud()
const DATA_PATH = fm.documentsDirectory() + "/quickPlay.json"
const CACHE_PATH = fm.documentsDirectory() + "/quickPlayCache.json"

const ACTION_TYPE = {
  "get": "설치",
  "update": "업데이트",
  "remove": "제거",
  "replace": "교체",
  "keychain_set": "키체인 값 쓰기"
}

let data = {}
if(fm.fileExists(DATA_PATH)){ data = JSON.parse(fm.readString(DATA_PATH)) }
if(data.recents == undefined){ data.recents = [] }

async function checkFilePath(destinationPath){
  if(fm.fileExists(destinationPath)){
    let alert = new Alert()
    alert.title = "해당 경로에 파일이 존재합니다"
    alert.message = "이미 존재하는 파일을 무시하고 덮어쓸까요?"
    alert.addAction("확인")
    alert.addCancelAction("취소")
    let response = await alert.presentAlert()
    return response
  } else { return 0 }
}

let queryInput = args.queryParameters
if(queryInput.type == "get" || queryInput.type == "update" || queryInput.type == "replace"){
  if(queryInput.fromurl != undefined){
    let script = await new Request(queryInput.fromurl).loadString()
    if(script == "404: Not Found"){
      // Github Gist URLError
      throw new Error("파일이 유효하지 않습니다.")
    }
    
    let scriptName = queryInput.scriptName != undefined ? queryInput.scriptName : ""
    let alert = new Alert()
    alert.title = "설치할 파일 이름을 입력하세요"
    alert.message = "외부 URL로부터 iCloud Drive 저장소에 파일을 설치하려고 합니다. 출처를 신뢰할 경우에만 작업을 계속 진행하세요."
    alert.addTextField(scriptName, scriptName)
    alert.addAction("확인")
    alert.addCancelAction("취소")
    let response = await alert.presentAlert()
    if(response == -1){ return 0 }
    
    let scriptPath = `${fm.documentsDirectory()}/${scriptName}`
    if(queryInput.type == "get"){
      if(await checkFilePath(scriptPath) == -1){ throw new Error("사용자가 파일 설치를 거부했습니다.") }
    }
    
    data.recents.unshift({
      "scriptName": scriptName,
      "type": queryInput.type,
      "fromurl": queryInput.fromurl,
      "version": queryInput.version != undefined ? queryInput.version : null,
      "timeStamp": new Date().getTime()
    })
    
    await fm.writeString(scriptPath, script)
    await fm.writeString(DATA_PATH, JSON.stringify(data))
    
    if(fm.fileExtension(scriptPath) == "js"){ Safari.open(`scriptable:///run?scriptName=${encodeURI(scriptName)}`) }
    return 0
    
  } else {
    throw new Error("소스 URL이 존재하지 않습니다.")
  }

} else if(queryInput.type == "remove"){
  if(fm.fileExists(queryInput.filePath)){
    if(fm.isFileStoredIniCloud(queryInput.filePath) && !fm.isFileDownloaded(queryInput.filePath)){
      await fm.downloadFileFromiCloud(queryInput.filePath)
    }
    
    let alert = new Alert()
    alert.title = "해당 경로의 파일을 제거할까요?"
    alert.message = queryInput.filePath
    alert.addDestructiveAction("제거")
    alert.addCancelAction("취소")
    
    let response = await alert.presentAlert()
    if(response == -1){ throw new Error("사용자가 작업을 거부했습니다.") }
    
    await fm.remove(queryInput.filePath)
    data.recents.unshift({
      "type": "remove",
      "filePath": queryInput.filePath,
      "timeStamp": new Date().getTime()
    })
    
    await fm.writeString(DATA_PATH, JSON.stringify(data))
    
    let alert2 = new Alert()
    alert2.title = "파일 삭제 완료됨"
    alert2.addAction("완료")
    await alert2.presentAlert()
    
  } else {
    throw new Error("작업 실패: 해당 경로에 파일이 존재하지 않습니다.")
    return -1
  }

} else if(queryInput.type == "keychain_set"){
  let alert = new Alert()
  alert.title = "키체인 쓰기 작업을 수행할까요?"
  if(await Keychain.contains(queryInput.key)){
    alert.message = "이미 해당 키에 데이터가 저장되어 있습니다. 작업을 계속할 경우 해당 키에 덮어쓰게 됩니다."
  }
  alert.addAction("확인")
  alert.addCancelAction("취소")
  
  let response = await alert.presentAlert()
  if(response == -1){ throw new Error("사용자가 작업을 거부했습니다.") }
  
  await Keychain.set(queryInput.key, queryInput.value)
  data.recents.unshift({
    "type": "keychain_set",
    "key": queryInput.key,
    "timeStamp": new Date().getTime()
  })
  
  await fm.writeString(DATA_PATH, JSON.stringify(data))
  
  let alert2 = new Alert()
  alert2.title = "키체인 쓰기 완료됨"
  alert2.addAction("완료")
  await alert2.presentAlert()

} else {
  let table = new UITable()
  table.showSeparators = true
  
  let title = new UITableRow()
  title.height = 120
  
  let titleText = title.addText("최근 작업")
  titleText.titleFont = Font.boldSystemFont(25)
  
  let installButton = title.addButton("URL에서 설치")
  installButton.rightAligned()
  
  installButton.onTap = async () => {
    let alert = new Alert()
    alert.title = "소스 URL을 입력하세요"
    alert.message = "파일의 Raw URL을 입력해야 합니다. URL Scheme은 허용되지 않습니다."
    alert.addTextField("", "")
    alert.addAction("확인")
    alert.addAction("클립보드에서 붙여넣기")
    alert.addCancelAction("취소")
    
    let response = await alert.presentAlert()
    
    if(response == -1){ throw -1 }
    let inputURL = response ? await Pasteboard.pasteString() : alert.textFieldValue()
    
    try{
      let script = await new Request(inputURL).loadString()
      if(script == "404: Not Found"){
        // Github Gist URLError
        throw new Error("파일이 유효하지 않습니다.")
      }
      
      let alert = new Alert()
      alert.title = "설치할 파일 이름을 입력하세요"
      alert.message = "파일의 확장자가 포함되어야 합니다."
      alert.addTextField("", "")
      alert.addAction("확인")
      await alert.presentAlert()
      
      let scriptName = alert.textFieldValue()
      if(scriptName == ""){ throw new Error("파일 이름이 올바른 형식이 아닙니다.") }
      let scriptPath = `${fm.documentsDirectory()}/${scriptName}`
      if(await checkFilePath(scriptPath) == -1){ throw new Error("사용자가 파일 설치를 거부했습니다.") }
      
      data.recents.unshift({
        "scriptName": scriptName,
        "type": "get",
        "fromurl": inputURL,
        "version": null,
        "timeStamp": new Date().getTime()
      })
      
      await fm.writeString(scriptPath, script)
      await fm.writeString(DATA_PATH, JSON.stringify(data))

      if(fm.fileExtension(scriptPath) == "js"){ Safari.open(`scriptable:///run?scriptName=${encodeURI(scriptName)}`) }
      return 0
      
    } catch(e){
      let alert = new Alert()
      alert.title = e.name
      alert.message = e.message
      alert.addAction("확인")
      await alert.presentAlert()
    }
  }
  
  table.addRow(title)
  
  for(let i = 0; i < data.recents.length; i++){
    let row = new UITableRow()
    row.height = 80
    row.dismissOnSelect = false
    
    let actionType = data.recents[i].type
    if(actionType == "get" || actionType == "update" || actionType == "replace"){
      let temp = data.recents[i].fromurl.split('/')
      let shortenURL = ""
      for(let j = 0; j < 4; j++){
        shortenURL = shortenURL + (j ? "/" : "") + temp[j]
      }
      
      let text = row.addText(data.recents[i].scriptName, ACTION_TYPE[actionType] + (data.recents[i].version == null ? "" : " • 버전 " + data.recents[i].version) + "\n" + shortenURL)
      text.subtitleFont = Font.systemFont(12.5)
      text.subtitleColor = Color.lightGray()
    } else if(actionType == "remove"){
      let temp = data.recents[i].filePath.split('/')
      
      let text = row.addText(temp[temp.length - 1], "제거")
      text.subtitleFont = Font.systemFont(12.5)
      text.subtitleColor = Color.lightGray()
    } else if(actionType == "keychain_set"){
      let text = row.addText(data.recents[i].key, "키체인 쓰기")
      text.subtitleFont = Font.systemFont(12.5)
      text.subtitleColor = Color.lightGray()
    }
    
    table.addRow(row)
    
    row.onSelect = async (ind) => {
      ind -= 1
      
      if(data.recents[ind]['type'].indexOf("keychain") != -1){
        let alert = new Alert()
        alert.title = "해당 작업은 다시 수행할 수 없습니다."
        alert.addAction("확인")
        
        await alert.presentAlert()
        throw -1
      }
      
      let alert = new Alert()
      alert.title = ACTION_TYPE[data.recents[ind].type] + " 작업을 다시 수행할까요?"
      alert.message = ""
      alert.addAction("확인")
      alert.addCancelAction("취소")
      
      let response = await alert.presentAlert()
      if(response != -1){
        let baseURL = "scriptable:///run?scriptName=QuickPlay"
        for(i in data.recents[ind]){
          if(data.recents[ind][i] == null){ continue }
          baseURL = baseURL + "&" + i + "=" + encodeURI(data.recents[ind][i])
        }
        Safari.open(baseURL)
      }
    }
  }
  
  if(data.recents.length){
    let removeRow = new UITableRow()
    
    let removeText = removeRow.addText("최근 기록 지우기")
    removeText.titleColor = Color.red()
    
    table.addRow(removeRow)
    
    removeRow.onSelect = async () => {
      data.recents = []
      await fm.writeString(DATA_PATH, JSON.stringify(data))
      Safari.open(URLScheme.forRunningScript())
      return 0
    }
  }
  
  await table.present()
  await fm.writeString(DATA_PATH, JSON.stringify(data))
}