export default class LibraryModel {

  constructor() {

  }

  async getLibrary() {

    try {

      const data = await fetch('http://localhost:81/projects/BookStack-App/bookstack-app/php/api/library.php?action=getLibrary')

      let books = await data.json()
      return books
      // return data
    } catch(err) {
        return err
    }
  }




  async addBook(data) {

    // TODO Check if book is already added
    let book = await this.getBook(data.isbn)
    if(book) return 'duplicate'

    const requestOptions = {
      method : 'POST',
      headers : { 'Content-Type': 'application/json' },
      body : JSON.stringify(data)
    }

    const googleResponse = await fetch('http://localhost:81/projects/BookStack-App/bookstack-app/php/api/Library.php?action=addBook', requestOptions)

  }


  

  async getBook(isbn) {
    const book = await fetch(`http://localhost:81/projects/BookStack-App/bookstack-app/php/api/Library.php?action=getBook&isbn=${isbn}`)

    return book.json()
  }



  async deleteBook(isbn) {
    try {

      const deletedBook = await fetch(`http://localhost:81/projects/BookStack-App/bookstack-app/php/api/Library.php?action=deleteBook&isbn=${isbn}`) 
      
      if (deletedBook.status === 200) return true

    } catch (error) {
      return false
    }
  }

}