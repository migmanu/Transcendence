# **Project Setup and Tutorial**

This document serves as a step-by-step guide to set up the project locally, understand the workflow, and build pages and components. It includes key concepts such as state management, cleanup contexts, event handling, CSS Modules, and routing.

---

## **1. Setting Up the Project**

### **Prerequisites**

- Install **Node.js**:

  - Download the latest LTS version from [Node.js official site](https://nodejs.org/).
  - Verify installation:

    ```bash
    node -v
    npm -v
    ```

- Install **pnpm**:

  - We use pnpm for faster, disk-efficient package management.
  - Install pnpm globally:

    ```bash
    npm install -g pnpm
    ```

  - Verify installation:

    ```bash
    pnpm -v
    ```

  - Why pnpm? Unlike npm or yarn, pnpm saves disk space by symlinking packages globally, ensuring faster installations and updates.

### **Option 1: Local Setup**

1. Install dependencies using pnpm:

   ```bash
   pnpm install
   ```

2. Start the development server:

   ```bash
   pnpm run dev
   ```

3. Open your browser and navigate to:

   ```
   http://localhost:8000
   ```

### **Option 2: Using Docker Compose**

1. Ensure Docker is running on your system.

   ```bash
   docker --version
   ```

2. Check if the .env file is present in the project root directory, if not create one with the content of the .env.example file. Uncomment the variables if it is a development environment or a production environment:

   ```bash
   #--- Develonment ---
   NODE_ENV=development
   DOCKER_FILE=dockerfiles/Dockerfile.dev
   STDIN_ENABLED=true
   TTY_ENABLED=true
   ```

3. Run the following command to start the Docker Compose services:

   ```bash
   docker compose up -d --build
   ```

   or without detach mode

   ```bash
      docker-compose up --build
   ```

4. Open your browser and navigate to:
   `http://localhost:8000`

---

## **2. Creating a Page**

### **Step 1: Create a New Page**

1. Navigate to `src/pages/`.
2. Create a new folder and file(The folder should be named the same as the page. the reason for the folder is to maintain the project clean, and avoid to have multiple .js .css files in pages), e.g., `NewPage/NewPage.js`:

```javascript
import { createSignal, createEffect } from '@reactivity';
import { createComponent, createCleanupContext, onCleanup } from '@component';

export default function NewPage() {
  const cleanup = createCleanupContext(); // Create cleanup context for the component

  const [count, setCount] = createSignal(0);

  createEffect(() => {
    console.log(`Count is now: ${count()}`);
    const intervalId = setInterval(() => {
      setCount((prev) => prev + 1);
    }, 1000);

    onCleanup(() => {
      clearInterval(intervalId);
    });
  });

  return createComponent('div', {
    className: 'page-container',
    children: [
      createComponent('h1', {
        content: 'New Page',
      }),
      createComponent('p', {
        content: () => `Count: ${count()}`,
      }),
    ],
    cleanup,
  });
}
```

### **Explanation**

- **`createCleanupContext()`**:
  - Ensures proper resource cleanup when the component is removed.
  - This is crucial for the main layout components or any page entry point.
- **`onCleanup()`**:
  - Removes `setInterval` or event listeners manually if required.
- **Automatic Event Cleanup**:
  - Any events added within `createComponent` are automatically unregistered when the component is destroyed.

### **Step 2: Adding the Page to the Router**

1. Open `src/main.js`.
2. Import the new page:

   ```javascript
   import NewPage from './pages/NewPage/NewPage';
   ```

3. Add the page to the `routes` array:

   ```javascript
   const routes = [
     ...,
     { path: '/new', component: NewPage },
   ];
   ```

4. Navigate to `http://localhost:3000/new` to view the page.

---

## **3. Creating a Component**

### **Step 1: Create a New Component**

1. Navigate to `src/components/`.
2. Create a new file and folder, e.g., `Button/Button.js`:

```javascript
import { createComponent } from '@component';
import styles from './Button.module.css';

export default function Button({ label, onClick }) {
  return createComponent('button', {
    className: styles.button,
    content: label,
    events: {
      click: onClick,
    },
  });
}
```

### **Step 2: Create a CSS Module**

1. In the same directory, create `Button.module.css`:

```css
.button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.button:hover {
  background-color: #0056b3;
}
```

### **Step 3: Using the Component**

Use the component in your page or another component:

```javascript
import Button from '@/components/Button/Button'; // @ is an alias for src/

export default function NewPage() {
  const handleClick = () => alert('Button clicked!');

  return createComponent('div', {
    children: [
      createComponent('h1', {
        content: 'New Page',
      }),
      Button({
        label: 'Click Me',
        onClick: handleClick,
      }),
    ],
  });
}
```

---

## **4. Using CSS Modules**

### **What are CSS Modules?**

CSS Modules scope styles locally to a specific component, avoiding global style conflicts.

### **How to Use CSS Modules**

1. Create a `.module.css` file with the same name as your component.
2. Import the CSS module into the component:

   ```javascript
   import styles from './ComponentName.module.css';
   ```

3. Apply styles using the imported `styles` object:

   ```javascript
   createComponent('div', {
     className: styles.className,
   });
   ```

---
