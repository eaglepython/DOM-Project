# DOM Bookstore Project - Walkthrough

## 📘 What You’re Building

You’ll create a **Bookstore Web Application** using basic front-end tools:

* 🧱 HTML for structure
* 🎨 Tailwind CSS for styling
* ⚙️ JavaScript for logic
* 🔌 `fetch()` to interact with a real Bookstore API (GET, POST, DELETE)

This guide is written like a class tutorial with simple language, perfect for beginners.

---

## 📁 1. Folder & File Setup

### 🛠 Step-by-Step Setup

1. Create a folder named `bookstore-project`
2. Inside that folder, create these files:

   * `index.html` → the web page
   * `style.css` → styling rules
   * `index.js` → your logic and interactivity
3. (Optional) Create `.env` for API secrets (advanced)

### ✅ Connect Everything

In your `index.html` file, connect your CSS and JS like this:

```html
<head>
  <title>Bookstore</title>
  <link rel="stylesheet" href="style.css">
  <script defer src="index.js"></script>
</head>
```

Use the **Live Server** extension in VS Code to run your site in the browser.

---

## 🏗️ 2. Build Your HTML (Structure)

This code goes in `index.html`. It sets up a form for adding books and a container to display them:

```html
<body>
  <h1>📚 My Bookstore</h1>
  <form id="book-form">
    <input type="text" id="title" placeholder="Book Title" required>
    <input type="text" id="author" placeholder="Author" required>
    <button type="submit">Add Book</button>
  </form>

  <div id="books-container"></div>
</body>
```

---

## 🎨 3. Tailwind Styling (style.css)

### Step 1: Add Tailwind CSS to your HTML

Put this in the `<head>`:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

### Step 2: Add Optional Custom Styles

```css
/* style.css */
body {
  font-family: sans-serif;
  margin: 2rem;
  background-color: #f9fafb;
}
```

You’ll style your buttons, inputs, and divs using Tailwind utility classes in HTML.

---

## 🧠 4. JavaScript Logic (index.js)

### 4.1 Access the DOM

```js
const form = document.getElementById('book-form');
const booksContainer = document.getElementById('books-container');
```

### 4.2 Add a Book (POST Request)

```js
form.addEventListener('submit', function(e) {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const author = document.getElementById('author').value;

  fetch('https://bookstore-api-six.vercel.app/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author })
  })
  .then(res => res.json())
  .then(() => {
    renderBooks();
    form.reset();
  });
});
```

### 4.3 Load Books (GET Request)

```js
function renderBooks() {
  booksContainer.innerHTML = '';
  fetch('https://bookstore-api-six.vercel.app/books')
    .then(res => res.json())
    .then(books => {
      books.forEach(book => {
        const div = document.createElement('div');
        div.classList.add('book-item');
        div.innerHTML = `
          <p><strong>${book.title}</strong> by ${book.author}</p>
          <button onclick="deleteBook('${book.id}')">Delete</button>
        `;
        booksContainer.appendChild(div);
      });
    });
}
```

### 4.4 Delete a Book (DELETE Request)

```js
function deleteBook(id) {
  fetch(`https://bookstore-api-six.vercel.app/books/${id}`, {
    method: 'DELETE'
  })
  .then(res => res.json())
  .then(() => renderBooks());
}
```

### 4.5 Start Everything on Load

```js
renderBooks();
```

---

## 🔁 5. How the App Flows

| Step | Action      | Code                                        |
| ---- | ----------- | ------------------------------------------- |
| 1️⃣  | Load page   | `renderBooks()` fetches books               |
| 2️⃣  | Add book    | Form sends a `POST` → re-fetches books      |
| 3️⃣  | Delete book | Button triggers `DELETE` → re-fetches books |

All actions reflect live updates using the DOM.

---

## 💾 6. Bonus: Save to Local Storage

```js
function renderBooks() {
  fetch('https://bookstore-api-six.vercel.app/books')
    .then(res => res.json())
    .then(books => {
      localStorage.setItem('books', JSON.stringify(books));
      displayBooks(books);
    });
}

function displayBooks(books) {
  booksContainer.innerHTML = '';
  books.forEach(book => {
    const div = document.createElement('div');
    div.innerHTML = `<p>${book.title} by ${book.author}</p><button onclick="deleteBook('${book.id}')">Delete</button>`;
    booksContainer.appendChild(div);
  });
}
```

---

## 🧪 7. GitHub Workflow (Team Practice)

1. Create a feature branch:

   ```bash
   git checkout -b add-form
   ```
2. Stage and commit:

   ```bash
   git add .
   git commit -m "Add book form feature"
   ```
3. Push and make a Pull Request (PR):

   ```bash
   git push origin add-form
   ```
4. Get it reviewed → then merge to `main`

---

## 🚀 8. Deployment (Vercel or Netlify)

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) or [netlify.com](https://netlify.com)
3. Sign in, connect your repo, and deploy
4. Share the live link!

---

## 📄 9. README Template

````markdown
# Bookstore Project

## Features
- Add / view / delete books
- Real API with fetch
- Styled using Tailwind CSS
- Bonus: localStorage cache

## Setup
```bash
git clone https://github.com/yourname/bookstore-project.git
cd bookstore-project
open index.html (Live Server)
````

## To Do

* Add book editing
* Add loading indicator
* Improve error handling

```

---

## ✅ 10. Final Checklist Before Submission
- [ ] HTML is valid and clean
- [ ] API works: GET, POST, DELETE
- [ ] Tailwind used throughout
- [ ] GitHub used with branches + PRs
- [ ] README included
- [ ] App deployed and link shared

---

You're now ready to build a real-world app like a pro! 🎓💻

```

