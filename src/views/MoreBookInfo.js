import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Style } from "react-style-tag"
import { GOOGLEURL, GOOGLEKEY} from '../config/config.js'

import imageNotAvailable from '../img/image-not-available.svg'
import iconBack from '../img/icon-back.png'
import iconBookIsRead from '../img/icon-book-isread.png'
import iconBookNotRead from '../img/icon-book-notread.png'
import iconDeleteBook from '../img/icon-delete-book.png'

import RatingStars from "../components/RatingStars.js"
import LoadingSpinner from "../components/LoadingSpinner"

export default function MoreBookInfo ({user, LIBRARYMODEL, setFlash}) {

  // Get ISBN from URL
  const isbn = useParams().isbn
  
  // For redirection
  const navigate = useNavigate()

  // Lose focus from input
  function loseFocus() {
    document.activeElement.blur()
  }

  // Get Book Data
  const [book, setBook] = useState([])
  const [bookUserData, setBookUserData] = useState()

  useEffect( () => {
    async function getBook() {
      const userRequest = await LIBRARYMODEL.getBookByUser(user.id, isbn)
      setBookUserData(userRequest)
      setIsRead(userRequest.is_read)

      try {

        const request = await fetch(GOOGLEURL + isbn + GOOGLEKEY)
        if (!request.ok) throw new Error('Bad Request')

        const data = await request.json()
        if (data.totalItems === 0) throw new Error('No Book Found')

        setBook(data.items[0].volumeInfo)
        
      } catch (err) {
        setFlash({
          type : 'fail',
          message : `Error: ${err}`
        })
      }
    }
    getBook()
  }, [isbn, LIBRARYMODEL, user.id, setFlash])


  const {
    averageRating,
    categories, 
    description,
    pageCount,
    ratingsCount,
    subtitle,
    title, 
  } = book

  // Use "image not available" image if no book is in database. 
  const cover = book.imageLinks ? book.imageLinks.smallThumbnail : imageNotAvailable

  // Format Authors based on if there is a single or multiple author
  let authors =''
  if (book.authors !== undefined) book.authors.forEach( author => authors += `${author}, `)
  authors = authors.slice(0, -2)

  
  
  // Book is read State
  const [isRead, setIsRead] = useState()
  
  return(
  <>
  <Style>{`
    .book-more-info-back {
      display : flex;
      align-items: center;
      gap : 0.5rem;
    }

    .book-more-info-img-wrapper {
      text-align: center;
    }

    .book-more-info-img {
      /* width : 90%; */
      height : 50vh;
      border-radius: 10px;
    }

    .book-more-info-title {
      text-align: center;
    }

    .book-more-info-authors,
    .book-more-info-categories,
    .book-more-info-rating,
    .book-more-info-page-count {
      display : block;
      margin-block: 0.5rem;
      text-align: center;
      color : #717171;
    }
        
    @media screen and (min-width : 750px) {

      .book-more-info {
        display : grid;
        align-items: start;
        column-gap: 5rem;
        row-gap: 0;
        grid-template-rows: auto;
        grid-template-areas: 
          "back back"
          "cover rating"
          "cover title"
          "cover authors"
          "cover categories"
          "cover pages"
          "cover description"
          "user-actions user-actions";
      }

      .book-more-info * { text-align: left; }

      .book-more-info-back { grid-area: back; }
      .book-more-info-img-wrapper { grid-area: cover; }
      .book-more-info-title { grid-area: title; }
      .book-more-info-authors { grid-area: authors; }
      .book-more-info-categories { grid-area: categories; }
      .book-more-info-page-count { grid-area: pages; }
      .book-more-info-rating { grid-area: rating; }
      .book-more-info-description { grid-area: description; }
      .book-more-info-user-actions { grid-area: user-actions; }
      .book-more-info-user-actions > * { display : block; }
    }
  `}</Style>

  {book.length === 0 && <LoadingSpinner /> } 

  <div className="book-more-info">

    <Link to="/library" className="book-more-info-back mb1">
      <img src={ iconBack } alt="Back to library" />
      Back to Library
    </Link>

    <div className="book-more-info-img-wrapper">
      <img src={ cover } alt="Book Cover" className="book-more-info-img"/>
    </div>


    <h2 className="book-more-info-title">
      <span>{title}</span>

      { subtitle && ': ' }
      <span>{subtitle}</span>
    </h2>

    <span className="book-more-info-authors">By: {authors}</span>
    <span className="book-more-info-categories">{categories}</span>
    <span className="book-more-info-page-count">{pageCount} Pages</span>

      {
      averageRating && 
        <span className="book-more-info-rating">
          <RatingStars rating={ averageRating } />&nbsp;
          {ratingsCount} ratings
      </span>
      }

    <div className="book-more-info-description">
      <h3>Description</h3>
      <p>{description}</p>
    </div>

    <div className="book-more-info-user-actions">
      <div className="my1">
        <button 
          onClick={ () => {
            LIBRARYMODEL.toggleReadStatus(bookUserData.book_id) 

            setIsRead(isRead === '1' ? '0' : '1')

            loseFocus()
          }}
          className="btn-more-book-info"
          > 
          <span>
              <img src={ isRead === '1' ? iconBookIsRead : iconBookNotRead } alt="" />
          </span>
          &nbsp; You have { isRead !== '1' && 'not ' } read this book.
        </button>
      
      </div>

      <div className="my1">
        <button
          onClick={ () => {
            LIBRARYMODEL.deleteBook(bookUserData.book_id) 

            setFlash({
              'message' : `${title} was deleted. Redirecting to Library in 5 seconds`,
              'type' : 'success'
            })

            setTimeout( () => {
              navigate('/library')
            }, 5000 )

            loseFocus()
          }}
          className="btn-more-book-info"
          >
          <span>
            <img src={ iconDeleteBook } alt="" />
          </span>
          &nbsp; Delete this book.
        </button>

      </div>
    </div>

  
  </div>
  </>
  )
}