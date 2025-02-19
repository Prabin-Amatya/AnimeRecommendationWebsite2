
import axios from 'axios'
import { useState } from 'react'
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'

let token = null

export const useResource = (baseUrl) => {

const getAll = async () => {
  console.log(token)
  const response = await axios.get(baseUrl,  {headers: { Authorization: token }})
  return response.data
}

const getById = async (id) => {
  const response = await axios.get(`${baseUrl}/${id}`)
  return response.data
}

const getByParam = async (query) => {
  const response = await axios.get(`${baseUrl}/?search=${query}`)
  return response.data
}

const create = async newObject => {
  var response;
  response = await axios.post(baseUrl, newObject, {headers: { Authorization: token }})
  console.log(response)
  return response.data
}

const update = async (newObject) => {
  var response
  response = await axios.put(`${ baseUrl }/${newObject.id}`, newObject, {headers: { Authorization: token , 'Content-Type': 'multipart/form-data'}})
  
  return response.data
}

const remove = async (newObject) => {
  const response = await axios.delete(baseUrl, {headers: { Authorization: token }, data: newObject})
  return response.data
}

const service = {
    create, getAll, update, getById, remove, getByParam
}
  
return [
    service
]
}


export const useUser = (baseUrl) => {
  const [user, setUser] = useState(null)

  const setToken = newToken => {
    token = `Token ${newToken}`
  }

  const login = async(newObject) =>{
    const response = await axios.post(baseUrl, newObject)
    setToken(response.data.token)
    setUser(response.data)
    window.localStorage.setItem('loggedInUser', JSON.stringify(response.data))
  }
  
  const logout = () =>{
    setToken(null)
    setUser(null)
    localStorage.removeItem('loggedInUser')
  
  }

  const service = {login, logout, setUser, setToken}

  return [user, service]
}


export const useSpecificQuery = (baseUrl, queryKey) => {
  const [services] = useResource(baseUrl)
  const queryClient = useQueryClient()

  const result = useQuery({
    queryKey: [queryKey],
    queryFn: services.getAll,
    refetchOnWindowFocus: false,
    retry: false
  })

  const newMutation = useMutation(
    {
      mutationFn: services.create,
      onSuccess: (new_object) =>{
        const all_objects = queryClient.getQueryData([queryKey])
        queryClient.setQueryData([queryKey], [...all_objects, new_object])
      }
    })

  const updateMutation = useMutation(
  {
    mutationFn: services.update,
    onSuccess: (new_object) =>{
      const all_objects = queryClient.getQueryData([queryKey])
      const new_object_list = all_objects.map(object => object.id === new_object.id? new_object: object)
      queryClient.setQueryData([queryKey], new_object_list)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: services.remove,
    onSuccess: (deletedObject) => {
      const all_objects = queryClient.getQueryData([queryKey]);
  
      if (all_objects) {
        console.log(deletedObject)
        const updatedList = all_objects.filter(obj => obj.anime !== deletedObject.anime);
        queryClient.setQueryData([queryKey], updatedList);
      }
    }
  })

  const create = async newObject => {
    await newMutation.mutate(newObject)
  }

  const update = async (newObject) => {
    await updateMutation.mutate(newObject)
  }

  const remove = async (deleteObject) => [
    await deleteMutation.mutate(deleteObject)
  ]

  const service = {create, update, remove}

  return [result, service]
}

export const useQueryForOneElement = (baseUrl, queryKey, id) => {
  const [services] = useResource(baseUrl)

  const result = useQuery({
    queryKey: [queryKey, id],
    queryFn: ({ queryKey }) => {
      const [, id] = queryKey;
      return services.getById(id);
    },
    refetchOnWindowFocus: false,
    retry: false
  })

  return [result]
}

export const useQueryForSearch = (baseUrl, queryKey, query) => {
  const [services] = useResource(baseUrl)

  const result = useQuery({
    queryKey: [queryKey, query],
    queryFn: ({ queryKey }) => {
      const [, query] = queryKey;
      return services.getByParam(query);
    },
    refetchOnWindowFocus: false,
    retry: false
  })

  return [result]
}
