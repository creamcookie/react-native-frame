
# react-native-ccs-frame

## Getting started

`$ npm install react-native-ccs-frame --save`

### Mostly automatic installation

`$ react-native link react-native-ccs-frame`

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-ccs-frame` and add `RNCcsFrame.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNCcsFrame.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.reactlibrary.RNCcsFramePackage;` to the imports at the top of the file
  - Add `new RNCcsFramePackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-ccs-frame'
  	project(':react-native-ccs-frame').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-ccs-frame/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-ccs-frame')
  	```

#### Windows
[Read it! :D](https://github.com/ReactWindows/react-native)

1. In Visual Studio add the `RNCcsFrame.sln` in `node_modules/react-native-ccs-frame/windows/RNCcsFrame.sln` folder to their solution, reference from their app.
2. Open up your `MainPage.cs` app
  - Add `using Ccs.Frame.RNCcsFrame;` to the usings at the top of the file
  - Add `new RNCcsFramePackage()` to the `List<IReactPackage>` returned by the `Packages` method


## Usage
```javascript
import RNCcsFrame from 'react-native-ccs-frame';

// TODO: What to do with the module?
RNCcsFrame;
```
  