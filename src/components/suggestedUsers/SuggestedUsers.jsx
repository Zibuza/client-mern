import React, { useState, useEffect } from 'react'
import classes from './suggestedUsers.module.css'
import man from '../../assets/man.jpg'
import { capitalizeFirstLetter } from '../../util/capitalizeFirstLetter'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { handleFollow } from '../../redux/authSlice'

const SuggestedUsers = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const dispatch = useDispatch()
  const { user, token } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_BASEURL}/user/find/suggestedUsers`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await res.json()
        setSuggestedUsers(data)
      } catch (error) {
        console.error(error)
      }
    }
    if (token) {  // to avoid fetching if token is undefined/null
      fetchSuggestedUsers()
    }
  }, [token])  // <-- added token here

  const toggleFollow = async (id) => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_BASEURL}/user/toggleFollow/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        method: "PUT"
      })
      setSuggestedUsers((prev) => prev.filter((user) => user._id !== id))
      dispatch(handleFollow(id))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className={classes.container}>
      <div className={classes.wrapper}>
        <div className={classes.myProfile}>
          <img src={man} alt="My profile" className={classes.profileUserImg} />
          <div className={classes.profileData}>
            <span>{capitalizeFirstLetter(user.username)}</span>
            <span className={classes.shortBio}>
              {user?.bio ? user.bio : "Life is full of adventures"}
            </span>
          </div>
        </div>
        {suggestedUsers?.length > 0 ? (
          <div className={classes.suggestedUsers}>
            <h3 className={classes.title}>Recommended users to follow</h3>
            {suggestedUsers.map((suggestedUser) => (
              <div className={classes.suggestedUser} key={suggestedUser._id}>
                <Link to={`/profileDetail/${suggestedUser._id}`}>
                  <img
                    src={suggestedUser?.photo ? suggestedUser.photo : man}
                    alt={`${capitalizeFirstLetter(suggestedUser.username)}'s profile`}
                    className={classes.imgUser}
                  />
                </Link>
                <div className={classes.suggestedUserData}>
                  <span>{capitalizeFirstLetter(suggestedUser.username)}</span>
                  <span className={classes.suggestedMsg}>Suggested to you</span>
                </div>
                <button onClick={() => toggleFollow(suggestedUser._id)} className={classes.followBtn}>
                  Follow
                </button>
              </div>
            ))}
          </div>
        ) : (
          <h3 className={classes.title}>You have no suggested users</h3>
        )}
      </div>
    </div>
  )
}

export default SuggestedUsers
