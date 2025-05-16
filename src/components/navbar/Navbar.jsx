import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AiOutlineClose, AiOutlineFileImage, AiOutlineLogout, AiOutlineSearch, AiOutlineUser } from 'react-icons/ai'
import { GiHamburgerMenu } from 'react-icons/gi'
import { logout, updateUser } from '../../redux/authSlice'
import { useDispatch, useSelector } from 'react-redux'
import man from '../../assets/man.jpg'
import classes from './navbar.module.css'
import { useState, useEffect } from 'react'

const Navbar = () => {
  const { token, user } = useSelector((state) => state.auth)
  const [searchText, setSearchText] = useState("")
  const [state, setState] = useState({})
  const [photo, setPhoto] = useState("")
  const handleState = (e) => {
    setState(prev => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const [showModal, setShowModal] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [allUsers, setAllUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // mobile
  const [showMobileNav, setShowMobileNav] = useState(false)

  // fetch all users
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_BASEURL}/user/findAll`)
        const data = await res.json()

        setAllUsers(data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchAllUsers()
  }, [])

  // added allUsers to dependency array
  useEffect(() => {
    if (searchText) {
      setFilteredUsers(allUsers.filter((user) => user.username.includes(searchText)))
    } else {
      setFilteredUsers(allUsers)
    }
  }, [searchText, allUsers])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleShowForm = () => {
    setShowForm(true)
    setShowModal(false)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    let filename = null
    if (photo) {
      const formData = new FormData()
      filename = crypto.randomUUID() + photo.name
      formData.append('filename', filename)
      formData.append('image', photo)

      await fetch(`${process.env.REACT_APP_BACKEND_BASEURL}/upload/image`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        method: 'POST',
        body: formData
      })
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_BASEURL}/user/updateUser/${user._id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        method: "PUT",
        body: JSON.stringify({ ...state, profileImg: filename })
      })

      const data = await res.json()
      setShowForm(false)
      dispatch(updateUser(data))
      window.location.reload()
    } catch (error) {
      console.error(error)
    }
  }


  return (
    <div className={classes.container}>
      <div className={classes.wrapper}>
        <div className={classes.left}>
          <Link to='/'>
            WebDevMania
          </Link>
        </div>
        <div className={classes.center}>
          <input value={searchText} onChange={(e) => setSearchText(e.target.value)} type="text" placeholder="Search user..." />
          <AiOutlineSearch className={classes.searchIcon} />
          {searchText && (
            <div onClick={() => setSearchText("")} className={classes.allUsersContainer}>
              {filteredUsers?.map((user) => (
                <Link to={`/profileDetail/${user._id}`} key={user._id}>
                  <img src={man} alt={`${user.username} profile`} />
                  <div className={classes.userData}>
                    <span>{user?.username}</span>
                    <span>{user?.bio?.slice(0, 10)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className={classes.right}>
          <Link to='/upload' style={{ textDecoration: 'none', color: 'inherit' }}>
            Upload
          </Link>
          <div className={classes.icons}>
            <AiOutlineUser aria-label="User icon" />
            <AiOutlineLogout onClick={handleLogout} aria-label="Logout icon" />
          </div>
          <img src={man} alt="Profile" className={classes.profileUserImg} onClick={() => setShowModal(prev => !prev)} />
          {showModal &&
            <div className={classes.modal}>
              <span onClick={handleShowForm}>Update Profile</span>
            </div>
          }
        </div>
        {
          showForm &&
          <div className={classes.updateProfileForm} onClick={() => setShowForm(false)}>
            <div className={classes.updateProfileWrapper} onClick={(e) => e.stopPropagation()}>
              <h2>Update Profile</h2>
              <form onSubmit={handleUpdateProfile}>
                <input type="text" placeholder='Username' name="username" onChange={handleState} />
                <input type="email" placeholder='Email' name="email" onChange={handleState} />
                <input type="text" placeholder='Bio' name="bio" onChange={handleState} />
                <input type="password" placeholder='Password' name="password" onChange={handleState} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '50%' }}>
                  <label htmlFor='photo'>Profile Picture <AiOutlineFileImage /></label>
                  <input
                    type="file"
                    id='photo'
                    placeholder='Profile picture'
                    style={{ display: 'none' }}
                    onChange={(e) => setPhoto(e.target.files[0])}
                  />
                  {photo && <p>{photo.name}</p>}
                </div>
                <button>Update profile</button>
              </form>
              <AiOutlineClose onClick={() => setShowForm(false)} className={classes.removeIcon} aria-label="Close form" />
            </div>
          </div>
        }
      </div>
      {
        <div className={classes.mobileNav}>
          {showMobileNav &&
            <div className={classes.navigation}>
              <div className={classes.left} onClick={() => setShowMobileNav(false)}>
                <Link to='/'>WebDevMania</Link>
              </div>
              <AiOutlineClose className={classes.mobileCloseIcon} onClick={() => setShowMobileNav(false)} aria-label="Close mobile nav" />
              <div className={classes.center}>
                <input value={searchText} type="text" placeholder='Search user...' onChange={(e) => setSearchText(e.target.value)} />
                <AiOutlineSearch className={classes.searchIcon} aria-label="Search icon" />
                {searchText && (
                  <div onClick={() => setSearchText("")} className={classes.allUsersContainer}>
                    {filteredUsers?.map((user) => (
                      <Link to={`/profileDetail/${user._id}`} key={user._id} onClick={() => setShowMobileNav(false)}>
                        <img
                          src={user?.photo ? `http://localhost:5000/images/${user.photo}` : man}
                          alt={`${user.username} profile`}
                        />
                        <div className={classes.userData}>
                          <span>{user?.username}</span>
                          <span>{user?.bio?.slice(0, 10)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div className={classes.right}>
                <Link style={{ textDecoration: 'none', color: 'inherit' }} to='/upload' onClick={() => setShowMobileNav(false)}>Upload</Link >
                <div className={classes.icons} onClick={() => setShowMobileNav(false)}>
                  <AiOutlineUser onClick={() => navigate(`/profileDetail/${user._id}`)} aria-label="User icon" />
                  <AiOutlineLogout onClick={handleLogout} aria-label="Logout icon" />
                </div>
                <img
                  onClick={() => setShowModal(!showModal)}
                  src={user?.profileImg ? `http://localhost:5000/images/${user.profileImg}` : man}
                  alt="Profile"
                  className={classes.profileUserImg}
                />
                {showModal && (
                  <div className={classes.modal}>
                    <span onClick={handleShowForm}>Update Profile</span>
                  </div>
                )}
              </div>
              {showForm &&
                <div className={classes.updateProfileForm} onClick={() => setShowForm(false)}>
                  <div className={classes.updateProfileWrapper} onClick={(e) => e.stopPropagation()}>
                    <h2>Update Profile</h2>
                    <form onSubmit={handleUpdateProfile}>
                      <input type="text" placeholder='Username' name="username" onChange={handleState} />
                      <input type="email" placeholder='Email' name="email" onChange={handleState} />
                      <input type="text" placeholder='Bio' name="bio" onChange={handleState} />
                      <input type="password" placeholder='Password' name="password" onChange={handleState} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '50%' }}>
                        <label htmlFor='photo'>Profile Picture <AiOutlineFileImage /></label>
                        <input
                          type="file"
                          id='photo'
                          placeholder='Profile picture'
                          style={{ display: 'none' }}
                          onChange={(e) => setPhoto(e.target.files[0])}
                        />
                        {photo && <p>{photo.name}</p>}
                      </div>
                      <button>Update profile</button>
                    </form>
                    <AiOutlineClose onClick={() => setShowForm(false)} className={classes.removeIcon} aria-label="Close form" />
                  </div>
                </div>}
            </div>}
          {!showMobileNav && <GiHamburgerMenu onClick={() => setShowMobileNav(prev => !prev)} className={classes.hamburgerIcon} aria-label="Open mobile nav" />}
        </div>
      }
    </div>
  )
}

export default Navbar
