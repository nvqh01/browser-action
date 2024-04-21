## **Instruction**

### **I. Navigation Actions:**

_**1. Activate Tab:**_

```
method: activateTab
params:
  + options: {
    index: number;
  }
```

_**2. Close Browser:**_

```
method: closeBrowser
```

_**3. Close Tab:**_

```
method: closeTab
params:
  + options: {
    index?: number;
    current: boolean;
  }
```

_**4. Go Back:**_

```
method: goBack
params:
  + options?: {
    timeout?: number;
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  }
```

_**5. Go Forward:**_

```
method: goForward
params:
  + options?: {
    timeout?: number;
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  }
```

_**6. New Tab:**_

```
method: activateTab
params:
  + options?: {
    url: string;
    timeout?: number;
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  }
```

_**7. Open Url:**_

```
method: openUrl
params:
  + options: {
    url: string
    timeout?: number;
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  }
```

_**8. Reload Tab:**_

```
method: reloadTab
params:
  + options: {
    index?: number;
    current: boolean;
  }
```

### **II. Mouse Actions:**

_**1. Click:**_

```
method: click
params:
  + options: {
    clickCount?: number
    delay?: number
    mouseButton?: 'left' | 'right'
    selectBy: {
      coordinates?: {
        x: number;
        y: number;
      };
      selector?: {
        type: 'xpath' | 'css' | 'text';
        value: string;
      }
    }
  }
```

_**2. Move Mouse:**_

```
method: moveMouse
params:
  + options: {
    coordinates: {
      x: number;
      y: number;
    }
  }
```

_**3. Scroll:**_

```
method: scroll
params:
  + options?: {
    timeoutSecs?: number;
    maxScrollHeight?: number;
    waitForSecs?: number;
    scrollDownAndUp?: boolean;
  }
```

### **III. Keyboard Actions:**

_**1. Press Key:**_

```
method: pressKey
params:
  + options: {
    delay?: number;
    keys?: string[];
  }
```

_**2. Type Text:**_

```
method: typeText
params:
  + options: {
      selector: {
        type: 'xpath' | 'css' | 'text';
        value: string;
      };
      speed?: number;
      text: string;
      typeAsHuman?: boolean;
  }
```

### **IV. Data Actions:**

_**1. Check Element Exists:**_

```
method: checkElementExists
params:
  + options: {
    selector: {
      type: 'xpath' | 'css' | 'text';
      value: string;
    };
    timeout?: number;
  }
```

_**2. Cookies:**_

```
method: cookies
params:
  + options: {
    type: 'import' | 'export' | 'clear';
    path?: string;
  }
```

_**3. Get Attribute:**_

```
method: getAttribute
params:
  + options: {
    attributeName: string;;
    selector: {
      type: 'xpath' | 'css' | 'text';
      value: string;
    };
    selectedVariable: string;
  }
```

_**4. Get Text:**_

```
method: getText
params:
  + options: {
    selector: {
      type: 'xpath' | 'css' | 'text';
      value: string;
    };
    selectedVariable: string;
  }
```

_**4. Get Url:**_

```
method: getUrl
params:
  + options: {
    selectedVariable: string;
  }
```

_**5. Save Asset:**_

```
method: saveAsset
params:
  + options: {
    fileName?: string
    outputDir: string
    saveAssetBy: {
      selector?: {
        type: 'xpath' | 'css' | 'text';
        value: string;
      }
      url?: string
    }
  }
```

_**6. Select Dropdown:**_

```
method: selectDropdown
params:
  + options: {
    selector: {
      type: 'xpath' | 'css' | 'text';
      value: string;
    };
    selectedValue: string;
  }
```

_**7. Set Variable:**_

```
method: setVariable
params:
  + options: {
    selectedVariable: string;
    operator: '=' | '+' | '-' | '*' | '/' | 'Concatenate';
    value: any;
  }
```

_**8. Upload File:**_

```
method: uploadFile
params:
  + options: {
    clickToUpload?: boolean;
    filePath: string;
    selector?: {
      type: 'xpath' | 'css' | 'text';
      value: string;
    };
  }
```

### **V. Other Actions:**

_**1. Condition:**_

```
method: condition
params:
  + options: {
    leftOperand: string;
    operator: '<' | '>' | '=' | '!=' | '<=' | '>=';
    rightOperand: string;
  }
```

_**2. Emulate:**_

```
method: emulate
params:
  + options: {
    device: {
      userAgent: string;
      viewport: {
        width: number;
        height: number;
      };
    }
  }
```

_**3. Eval:**_

```
method: eval
params:
  + options: {
    script: string;
    selectedVariable: string;
  }
```

_**4. Loop:**_

```
method: loop
params:
  + options: {
    actions: {
      name: string;
      options: any;
    }[]
    loopType: 'for' | 'while';

    // Use for loop type "For"
    forFromValue?: number;
    forToValue?: number;

    // Use for loop type "While"
    leftOperand?: string;
    operator?: '<' | '>' | '=' | '!=' | '<=' | '>=';
    rightOperand?: string;
  }
```

_**5. Screenshot:**_

```
method: screenshot
params:
  + options: {
    fileName: string;
    path: string;
  }
```

_**6. Sleep:**_

```
method: sleep
params:
  + options: {
    seconds: number;
    random?: {
      from: number;
      to: number;
    }
  }
```
