import React, { useState } from 'react'
import classes from './upload.module.css'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AiOutlineFileImage } from 'react-icons/ai'

const Upload = () => {
  const [state, setState] = useState({})
  const [photo, setPhoto] = useState("")
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const handleState = (e) => {
    setState(prev => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()

    try {
      let filename = null

      if (photo) {
        const formData = new FormData()
        filename = crypto.randomUUID() + photo.name
        formData.append("filename", filename)
        formData.append("image", photo)

        await fetch(`${process.env.REACT_APP_BACKEND_BASEURL}/upload/image`, {
          headers: {
            "Authorization": `Bearer ${token}`
          },
          method: 'POST',
          body: formData
        })
      }

      // If you don't use the response, no need to assign
      await fetch(`${process.env.REACT_APP_BACKEND_BASEURL}/post`, {
        headers: {
          "Content-Type": 'application/json',
          "Authorization": `Bearer ${token}`
        },
        method: "POST",
        body: JSON.stringify({ ...state, photo: filename })
      })

      navigate('/')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className={classes.container}>
      <div className={classes.wrapper}>
        <h2>Upload Post</h2>
        <form onSubmit={handleCreatePost}>
          <input type="text" name="title" placeholder="Title..." onChange={handleState} />
          <input type="text" name="desc" placeholder="Description..." onChange={handleState} />
          <label htmlFor='photo'>Upload photo <AiOutlineFileImage /></label>
          <input
            type="file"
            id='photo'
            style={{ display: 'none' }}
            onChange={(e) => setPhoto(e.target.files[0])}
          />
          <input type="text" name="location" placeholder="Location..." onChange={handleState} />
          <button>Submit</button>
        </form>
      </div>
    </div>
  )
}

export default Upload
