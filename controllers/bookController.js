// En /controllers/bookController.js

const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
const asyncHandler = require('express-async-handler');

// Display list of all books.
exports.book_list = (req, res) => {
    res.send('NOT IMPLEMENTED: Book list');
};

// Display detail page for a specific book.
exports.book_detail = (req, res) => {
    res.send('NOT IMPLEMENTED: Book detail: ' + req.params.id);
};

// Display book create form on GET.
exports.book_create_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Book create GET');
};

// Handle book create on POST.
exports.book_create_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Book create POST');
};

// Display book delete form on GET.
exports.book_delete_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Book update POST');
};

exports.book_list = asyncHandler(async (req, res, next) => {
    const allBooks = await Book.find({}, 'title author')
        .sort({ title: 1 })
        .populate('author')
        .exec();

    res.render('book_list', { title: 'Book List', book_list: allBooks });
});

// Index page of book catalog
exports.index = asyncHandler(async (req, res, next) => {
    const numBooks = Book.countDocuments({});
    const numBookInstances = BookInstance.countDocuments({});
    const numAvailableBookInstances = BookInstance.countDocuments({ status: 'Available' });
    const numAuthors = Author.countDocuments({});
    const numGenres = Genre.countDocuments({});
  
    const [bookCount, bookInstanceCount, availableBookInstanceCount, authorCount, genreCount] = await Promise.all([
      numBooks, numBookInstances, numAvailableBookInstances, numAuthors, numGenres
    ]);
  
    res.render('index', {
      title: 'Local Library Home',
      book_count: bookCount,
      book_instance_count: bookInstanceCount,
      book_instance_available_count: availableBookInstanceCount,
      author_count: authorCount,
      genre_count: genreCount
    });
  });
  