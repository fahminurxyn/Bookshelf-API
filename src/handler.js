const { nanoid } = require("nanoid");
const books = require("./books");

const addBookHandler = (request, h) => {
    try {
        const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

        if (!name) {
            return h.response({ status: 'fail', message: 'Gagal menambahkan buku. Mohon isi nama buku' }).code(400);
        }

        if (readPage > pageCount) {
            return h.response({ status: 'fail', message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount' }).code(400);
        }

        const id = nanoid(16);
        const insertedAt = new Date().toISOString();
        const updatedAt = insertedAt;
        const finished = pageCount === readPage;

        const newBook = { id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt };
        books.push(newBook);

        if (!books.find(book => book.id === id)) {
            throw new Error('Buku gagal disimpan ke dalam database.');
        }

        return h.response({ status: 'success', message: 'Buku berhasil ditambahkan', data: { bookId: id } }).code(201);
    } catch (error) {
        return h.response({ status: 'fail', message: 'Buku gagal ditambahkan' }).code(500);
    }
};

module.exports = { addBookHandler };
