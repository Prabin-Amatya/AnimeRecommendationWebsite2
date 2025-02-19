import { FormControl, InputLabel, OutlinedInput, TextField } from "@mui/material"
import API_URLS from "../../config"
import { useSpecificQuery } from "../../hooks"
import { useEffect, useState } from "react"
import "../../static/index.css"
import { useNavigate } from "react-router-dom"

const AnimeList = ({currAnime, setCurrAnime, user, setMessage}) =>{
  const [animes, animeQueries] = useSpecificQuery(API_URLS.anime, "anime")
  const [favorites, favoriteQueries] = useSpecificQuery(API_URLS.favorites, "favourite")
  const [addOrRemove, setAddOrRemove] = useState(false)
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const handleInputChange = (e) =>{
    setSearch(e.target.value)
    console.log(search)
  }

  const handleBlur = () =>{
    setTimeout(()=>{
      setSearch("")
    }, 250)
  }

  const handleClick = (anime) =>{
    console.log(anime)
    setCurrAnime(anime)
  }

  const handleAddFavourite = (anime) =>{
    if(!user){
      navigate("/Login")
    }
    else{
      try{
        favoriteQueries.create({"anime": anime.id})
        setMessage("Anime Added To Favorites")
      }
      catch(e){
        setMessage("Failed To Add Anime Added To Favorites")
      }
    }
  }

  const handleRemoveFavourite = (anime) =>{
  try{
    favoriteQueries.remove({"anime": anime.id})
    setMessage("Anime Removed From Favorites")
  }
  catch(e){
    console.log(e)
    setMessage("Failed To Remove Anime From Favorites")
  }
  }

  useEffect(()=>{
    if(favorites.isFetched == true && currAnime!=null)
       { console.log("UseEffect")
          console.log(favorites.data?.some(anime=>anime.anime == currAnime.id))
          console.log(favorites.data)
        setAddOrRemove(favorites.data?.some(anime=>anime.anime == currAnime.id))}
  },[favorites, currAnime])

  console.log(favorites.isFetched && favorites.data)

  const background = currAnime?"radial-gradient(circle, #473b3b, #413d3d, #2b2323, #000000)":"none"
  const border = currAnime?"3px solid #a9a9a9":"none"
  const top = currAnime?"15%":"100%"
  return(
    <div style={{'display': 'flex', 'width': '455px', marginTop:'2vh', border:border, borderRadius:"25px", flexFlow:'column', alignItems:"center", background:background, position:"relative"}}>
      <div style={{color:"#9f9f9f", textAlign:"center", marginTop:"2vh"}}>Add To Favourite</div>
      <FormControl sx={{borderBottom:"2px solid #9f9f9f", mt:"2vh", mb:"2vh"}}>
        <InputLabel
          sx={{color:"#9f9f9f"}}
        >
            Search
        </InputLabel>
        <OutlinedInput label="Search" sx={{
                                    "&:hover": {
                                      color: "#9f9f9f", // Change placeholder color on hover
                                    },
                                    "& fieldset": { border: "none" }, // Removes the border
                                    "&:hover fieldset": { border: "none" }, // Prevents border on hover
                                    "&.Mui-focused fieldset": { border: "none" }, 
                              }}
                              
                            value={search}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            />
                            
      </FormControl>

      {search != ""?
      <div style={{"overflowY":"visible", height:"40vh", position:"absolute", padding: 0, top: top, left: "20%"}}>
        {animes.isFetched && animes.data.filter(e=>e.title_english?.toLowerCase().includes(search.toLowerCase())||e.title_romanji?.toLowerCase().includes(search.toLowerCase())).slice(0,10).map((anime, index) => {
          return(
            <div className="similarShows" 
                  key={anime.id} id={anime.id}  
                  onClick={() => handleClick(anime)}
                  style={index==0 ? {marginTop:"0px"}:{}}
                  >
                {anime.title_english ?? anime.title_romanji}
            </div>)
        })}
      </div>: null}

      {currAnime && 
      <div style={{'display': 'flex', alignItems:"center", flexFlow:"column"}}>
        <div className="animeDetails">{currAnime.title_english ?? currAnime.title_romanji}</div>
        <img src={currAnime.image_url} width={200} height={200}/>
        <div className="animeDetails">Description<br/></div>
        <div className="animeDetails" style={{overflow:"auto", height:"130px", marginTop:"0px"}}> {currAnime.description}</div>
        <div className="animeDetails">Episodes: {currAnime.episodes}</div>
        <div className="animeDetails">Status: {currAnime.status}</div>
        <div className="animeDetails">Release Date: {currAnime.release_date}</div>
        <div className="animeDetails">Studio: {currAnime.studio}</div>
        <div style={{display:"flex", width:"100%", justifyContent:"space-evenly"}}>
          <button style={{background:'transparent'}}>Show Trailer</button>
          <button style={{background:'transparent'}} 
                  onClick={()=>addOrRemove?handleRemoveFavourite(currAnime):handleAddFavourite(currAnime)}
                  >
                    {addOrRemove?"Remove":"Add"}</button>
        </div>
        
        {/* <iframe
          width="100px"
          height="100px"
          src={"https://www.youtube.com/embed/" + currAnime.trailer?.replace("youtube:", "")}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe> */}

      </div>
      }
    </div>
  )
}

export default AnimeList