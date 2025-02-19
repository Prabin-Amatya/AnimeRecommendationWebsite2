import { useSearchParams } from "react-router-dom"
import { useQueryForSearch, useSpecificQuery } from "../../hooks"
import API_URLS from "../../config"

const Favorites = () =>{
  const [favorites, favoriteQueries] = useSpecificQuery(API_URLS.favorites, "favourite")
  const [animes, animeQueries] = useSpecificQuery(API_URLS.anime, "anime")

  return (
  <div>
    {animes.isFetched && favorites.isFetched && animes.data.filter(anime=>favorites.data.some(favorite=>favorite.anime == anime.id)).map(anime=>
          <div key={anime.id} style={{color:"white"}}>{anime.title_romanji}</div>
    )}
  </div>
  )
}

export default Favorites