import React from 'react'
import { useState, useEffect } from "react"
import {useDebounce} from 'react-use'
import Search from './Components/search'
import MovieCard from './Components/MovieCard'
import Spinner from "./Components/Spinner";
import { updateSearchCount,getTrendingMovies } from './appwrite.js'


const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
if (!API_KEY) {
  console.error("API Key is missing. Please set the API key in your environment variables.");
}
console.log("API Key:", API_KEY); // Verify the API key

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}
console.log("API Options:", API_OPTIONS); // Verify the API options

const App = () => {
  const [searchTerm, setSearchTerm]=useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setisLoading] = useState('');
  const [deBouncedSearchTerm, setDeBouncedSearchTerm] = useState('')
  
  useDebounce(() => setDeBouncedSearchTerm(searchTerm), 500, [searchTerm]);

  
  const fetchMovies = async(query = '') =>{
    setisLoading(true);
    setErrorMessage('');
    try{
      const endpoint = query ? 
      `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      console.log("Endpoint:", endpoint); // Verify the endpoint
      const response = await fetch(endpoint, API_OPTIONS); 

      if(!response.ok){
        const errorText = await response.text();
        console.error(`Error response: ${errorText}`); // Log the error response
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();

      if(data.Response === 'False'){
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);  // Pass searchTerm correctly
      }
      
     }
    catch(error){
      console.error(`Error catching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.')
      }finally{
        setisLoading(false);
      }
  }

  const loadTrendingMovies = async () => {
    try {
      const trendingMovies = await getTrendingMovies();
      setTrendingMovies(trendingMovies);
    }
    catch (error) {
      console.error(error);
    }
  }

  useEffect(() =>{
    fetchMovies(deBouncedSearchTerm);
  },[deBouncedSearchTerm]
  )

  useEffect(() => {
    loadTrendingMovies();
  }
  ,[])
  
  return (
    <main>
      <div className="pattern"/>
      <div className='wrapper'>
        <header>
          <img src='./hero.png' alt='hero banner'/>
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>

          <Search searchTerm = {searchTerm} setSearchTerm = {setSearchTerm} />
          {/* <h1 className='text-white'>{searchTerm}</h1> */}
        </header>

        {trendingMovies && trendingMovies.length > 0 && (
          <section className='trending'>
            <h2 className='text-white'>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key = {movie.id}>
                  <p>{index + 1}</p>
                  <img src = {movie.poster_url} alt={movie.title}/>
                </li>
              ))}
            </ul>
          </section>
          )}
        <section className='all-movies'>
          <h2>All Movies</h2>
          { isLoading ? (
            <Spinner/>
          ):(
      <ul>
        {movieList.map((movie, index) => (
          <MovieCard key ={index} movie ={movie}/>
        ))}
      </ul>

                )}

              </section>
            </div>
          </main>

        )
      }

export default App