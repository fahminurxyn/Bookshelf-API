const { nanoid } = require("nanoid");
const books = require("./books");

const addBookHandler = (request, h) => {
  try {
    const {
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
    } = request.payload;

    if (!name) {
      return h
        .response({
          status: "fail",
          message: "Gagal menambahkan buku. Mohon isi nama buku",
        })
        .code(400);
    }

    if (readPage > pageCount) {
      return h
        .response({
          status: "fail",
          message:
            "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
        })
        .code(400);
    }

    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const finished = pageCount === readPage;

    const newBook = {
      id,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      insertedAt,
      updatedAt,
    };
    books.push(newBook);

    if (!books.find((book) => book.id === id)) {
      throw new Error("Buku gagal disimpan ke dalam database.");
    }

    return h
      .response({
        status: "success",
        message: "Buku berhasil ditambahkan",
        data: { bookId: id },
      })
      .code(201);
  } catch (error) {
    return h
      .response({ status: "fail", message: "Buku gagal ditambahkan" })
      .code(500);
  }
};

const getAllBooksHandler = (request, h) => {
  const { finished, reading } = request.query;

  let filteredBooks = books;
  
  if (finished !== undefined) {
    if (finished !== "0" && finished !== "1") {
      return h.response({
        status: "fail",
        message: "Query parameter finished harus bernilai 0 atau 1",
      }).code(400);
    }
    const isFinished = finished === "1";
    filteredBooks = filteredBooks.filter((book) => book.finished === isFinished);
  }

  if (reading !== undefined) {
    if (reading !== "0" && reading !== "1") {
      return h.response({
        status: "fail",
        message: "Query parameter reading harus bernilai 0 atau 1",
      }).code(400);
    }
    const isReading = reading === "1";
    filteredBooks = filteredBooks.filter((book) => book.reading === isReading);
  }

  console.log(`Filtered books count: ${filteredBooks.length}`);

  return h.response({
    status: "success",
    data: {
      books: filteredBooks.map(({ id, name, publisher }) => ({ id, name, publisher })),
    },
  }).code(200);
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const book = books.filter((b) => b.id === id)[0];

  if (book !== undefined) {
    return {
      status: "success",
      data: {
        book,
      },
    };
  }

  const response = h.response({
    status: "fail",
    message: "Buku tidak ditemukan",
  });
  response.code(404);
  return response;
};

const updateBookByIdHandler = (request, h) => {
  try {
    const { id } = request.params;
    const {
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
    } = request.payload;
    const book = books.findIndex((b) => b.id === id);

    if (book === -1) {
      return h
        .response({
          status: "fail",
          message: "Gagal memperbarui buku. Id tidak ditemukan",
        })
        .code(404);
    }

    if (!name) {
      return h
        .response({
          status: "fail",
          message: "Gagal memperbarui buku. Mohon isi nama buku",
        })
        .code(400);
    }

    if (readPage > pageCount) {
      return h
        .response({
          status: "fail",
          message:
            "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
        })
        .code(400);
    }

    books[book] = {
      ...books[book],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      finished: pageCount === readPage,
      updatedAt: new Date().toISOString(),
    };

    return h
      .response({ status: "success", message: "Buku berhasil diperbarui" })
      .code(200);
  } catch (error) {
    return h
      .response({ status: "fail", message: "Gagal memperbarui buku" })
      .code(500);
  }
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const book = books.findIndex((b) => b.id === id);

  if (book !== -1) {
    books.splice(book, 1);
    const response = h.response({
      status: "success",
      message: "Buku berhasil dihapus",
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: "fail",
    message: "Buku gagal dihapus. Id tidak ditemukan",
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  updateBookByIdHandler,
  deleteBookByIdHandler,
};
