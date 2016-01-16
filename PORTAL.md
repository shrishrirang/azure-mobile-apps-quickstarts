## Configure your client application

## Create A New App

Download your personalized Cordova project and unzip it. The project is pre-configured to work with your hosted Mobile App backend.

There are two ways in which you can use the downloaded project:
  1. Using the [Cordova CLI](https://cordova.apache.org/docs/en/latest/guide/cli/index.html) to build and run the project.
  2. Using [Visual Studio Tools For Apache Cordova](https://www.visualstudio.com/en-us/features/cordova-vs.aspx) on a Windows PC to debug/run the app on various platforms (android, iOS, Windows and Windows Phone) from within Visual Studio.

Following sections describe the steps for using either approach.

### Running Using Cordova CLI

#### Prerequisites
  1. Install [Cordova CLI](https://cordova.apache.org/docs/en/latest/guide/cli/index.html)
  2. Install the target platform SDK and tools

#### Run Your App
  1. Open a command prompt and change to the directory containing the unzipped project
  2. Add the platform you want to build the quickstart for:

        cordova platform add [android | ios | windows | wp8]
  3. Run the quickstart
  
        cordova run [android | ios | windows | wp8]

### Running Using Visual Studio

#### Prerequisites
  1. Windows PC
  2. [Visual Studio Tools For Apache Cordova](https://www.visualstudio.com/en-us/features/cordova-vs.aspx)
  3. Refer [Visual Studio Documentation](https://taco.visualstudio.com/en-us/docs/run-app-apache/) for platform specific setup needed for building, debugging and running your app.

#### Run Your App

Launch Visual Studio and open the .sln file present in the directory containing the unzipped project. Refer the [Visual Studio documentation](https://taco.visualstudio.com/en-us/docs/run-app-apache/) for detailed instructions for debugging and running on different platforms.

Refer [Visual Studio documentation](https://taco.visualstudio.com/en-us/docs/known-issues-general/) for known issues.

## Use An Existing App

Follow these steps to connect your existing Cordova app to a Mobile Apps cloud backend. These steps work with a Visual Studio based Cordova project as well as a Cordova project created using the Cordova CLI.

  1. Open command prompt and switch to the directory containing your Cordova project.
  2. Add the Mobile Apps Cordova plugin

        cordova plugin add cordova-plugin-ms-azure-mobile-apps
  3. Add the following code at an appropriate place in your project's javascript code:

        var client = new WindowsAzure.MobileServiceClient(ZUMOAPPURL);
  4. Use the Azure Mobile Apps API to insert data in the _todoitem_ table:
        
        var item = { text: 'Awesome Item', complete: false };
        client.getTable('todoitem').insert(item);
  
