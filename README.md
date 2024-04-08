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

_**3. Select Dropdown:**_

```
method: selectDropdown
params:
  + options: {
    selector: {
      type: 'xpath' | 'css' | 'text';
      value: string;
    };
    selectedValue: string
  }
```

_**4. Set Variable:**_

```
method: setVariable
params:
  + options: {
    selectedVariable: string
    operator: '=' | '+' | '-' | '*' | '/' | 'Concatenate'
    value: number | string
  }
```

### **V. Other Actions:**

_**1. Emulate:**_

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

_**2. Screenshot:**_

```
method: screenshot
params:
  + options: {
    fileName: string
    path: string
  }
```

_**3. Sleep:**_

```
method: sleep
params:
  + options: {
    seconds: number
    random?: {
      from: number
      to: number
    }
  }
```
