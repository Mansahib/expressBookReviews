const express = require('express');
const router = express.Router();
const books = require("./booksdb.js");

// Task 10: Get all books (Async/Await)
router.get('/', async (req, res) => {
  try {
    // Simulate async operation
    const getBooks = () => {
      return new Promise((resolve) => {
        process.nextTick(() => resolve(books));
      });
    };
    
    const bookList = await getBooks();
    res.status(200).json(bookList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

// Task 11: Get book by ISBN (Promise)
router.get('/isbn/:isbn', (req, res) => {
  new Promise((resolve, reject) => {
    process.nextTick(() => {
      const book = books[req.params.isbn];
      book ? resolve(book) : reject("Book not found");
    });
  })
  .then(book => res.status(200).json(book))
  .catch(err => res.status(404).json({ message: err }));
});

// Task 12: Get books by author (Async/Await)
router.get('/author/:author', async (req, res) => {
  try {
    const getBooks = () => {
      return new Promise((resolve) => {
        process.nextTick(() => resolve(books));
      });
    };
    
    const allBooks = await getBooks();
    const filtered = Object.values(allBooks).filter(book => 
      book.author.toLowerCase().includes(req.params.author.toLowerCase())
    );
    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ message: "Error searching by author" });
  }
});

// Task 13: Get books by title (Async/Await)
router.get('/title/:title', async (req, res) => {
  try {
    const getBooks = () => {
      return new Promise((resolve) => {
        process.nextTick(() => resolve(books));
      });
    };
    
    const allBooks = await getBooks();
    const filtered = Object.values(allBooks).filter(book => 
      book.title.toLowerCase().includes(req.params.title.toLowerCase())
    );
    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ message: "Error searching by title" });
  }
});

module.exports.general = router;