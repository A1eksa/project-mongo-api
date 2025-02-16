import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import booksData from './data/books.json';

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/project-mongo';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get('/', (req, res) => {
  const apiGuide = {
    Endpoints: [
      {
        '/books------------------------->': 'Get all books',
        '/books/id/--------------------->': 'Get book by Id',
        '/books/isbn/--------------------->': 'Get book by Isbn',
      },
    ],
  };
  res.send(apiGuide);
});

const Book = mongoose.model('Book', {
  bookID: Number,
  title: String,
  authors: String,
  average_rating: Number,
  isbn: Number,
  isbn13: Number,
  languageCode: String,
  numPages: Number,
  ratings_count: Number,
  text_reviews_count: Number,
});

///prevents repeating adding same data
if (process.env.RESET_DB) {
  const seedDatabase = async () => {
    await Book.deleteMany();

    booksData.forEach((item) => {
      const newBook = new Book(item);

      newBook.save();
    });
  };
  seedDatabase();
}

app.get('/books', async (req, res) => {
  const books = await Book.find({});
  res.json(books);
});

app.get('/books/id/:id', async (req, res) => {
  const bookById = await Book.findById(req.params.id);
  try {
    if (bookById) {
      res.json(bookById);
    } else {
      res.status(404).json({ error: 'BookId not found' });
    }
  } catch (err) {
    res.status(400).json({ error: 'Bad request!' });
  }
});

app.get('/books/isbn/:isbnNr', async (req, res) => {
  const { isbnNr } = req.params;

  try {
    const book = await Book.findOne({ isbn: isbnNr });
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Bad request' });
  }
});

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on http://localhost:${port}`);
});
