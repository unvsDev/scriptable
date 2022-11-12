# Scriptable
## QuickPlay
<div>
<img width="300" src="https://user-images.githubusercontent.com/63099769/201468191-bc30b17f-d7e0-4954-aaa5-a84df0752a79.PNG">
<img width="300" src="https://user-images.githubusercontent.com/63099769/201468189-9f96d8ce-9d04-4ae3-8584-245c982a9826.PNG">
</div>
</br>
Scriptable 파일을 손쉽게 설치하고, 각종 작업을 수행할 수 있습니다. 외부 URL Scheme을 지원해 목표하는 작업 흐름을 최종 사용자에게 빠르게 배포할 수 있습니다.

* [여기](https://github.com/unvsDev/scriptable/releases/download/1.0.1/QuickPlay.js)를 눌러 기기에 QuickPlay를 설치할 수 있습니다.

### Supported Action
### 설치, 업데이트 및 교체

`scriptable:///run?scriptName=QuickPlay&type=[Action Type]&scriptName=[Your Script Name]&version=[Target Version]&fromurl=[Raw File URL]`

- `Action Type`: get, update, replace 중 입력 (사용자의 기록에 표시될 작업 종류)
- `Your Script Name`: 확장자를 포함한 설치할 스크립트(파일)의 전체 이름
- `Target Version`: 해당 파일의 버전 (선택)
- `Raw File URL`: 해당 파일을 다운로드받을 Raw URL

### 제거

`scriptable:///run?scriptName=QuickPlay&type=remove&filePath=[Destination Path]`

- `Destination Path`: 제거할 파일의 전체 경로

### 키체인 쓰기

`scriptable:///run?scriptName=QuickPlay&type=keychain_set&key=[Your Key]&value=[Your Value]`

- `key`: 할당할 키체인 키
- `value`: 할당할 키체인 값

### Note
* 지원하는 작업을 수행하기 위해서는 QuickPlay가 먼저 설치되어 있어야 하며, 일부 작업은 기기에 iCloud Drive가 활성화되어야 합니다.
* 키체인 쓰기 작업은 최근 작업에서 다시 수행할 수 없습니다. (`value`는 `args.queryParameters`에서 가져온 후 다시 저장하지 않음)
* 최근 작업 기록은 `/private/var/mobile/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents/quickPlay.json`에 저장됩니다.
