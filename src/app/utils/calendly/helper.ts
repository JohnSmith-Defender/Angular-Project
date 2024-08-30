import { GET_CALENDLY_ACCOUNT_EVENTS_LIST, GET_CALENDLY_ACCOUNT_ORGANIZATION_URI } from "@lib/api-constants";

export const fetchOrganizaitonUrl= async (token)=> {
  try {
    if (token) {
      const data = await (await fetch(GET_CALENDLY_ACCOUNT_ORGANIZATION_URI,{
        headers:{
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })).json()
      return data?.resource?.current_organization;
    }else{
      return false
    } 
  } catch (error) {
    console.log(error);
  }
}

export const fetchUserUrl= async (token)=> {
  try {
    if (token) {
      const data = await (await fetch(GET_CALENDLY_ACCOUNT_ORGANIZATION_URI,{
        headers:{
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })).json()
      return data?.resource?.uri;
    }else{
      return false
    } 
  } catch (error) {
    console.log(error);
  }
}

export const checkIfValidCalendlyAccount = async (token,calendlyUrl)=>{
  try {
    const organizationUrl = await fetchOrganizaitonUrl(token);
    if (organizationUrl) {
      let data = await (await fetch(`${GET_CALENDLY_ACCOUNT_EVENTS_LIST}?organization=${organizationUrl}`,{
        headers:{
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })).json()

      if(data?.collection && data?.collection?.length > 0) {
      } else {
        const userUrl = await fetchUserUrl(token);
        data = await (await fetch(`${GET_CALENDLY_ACCOUNT_EVENTS_LIST}?user=${userUrl}`,{
          headers:{
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        })).json()
      }

      const eventList = data?.collection?.map(event => {
        return{
          active:event.active,
          calendly_url:event.scheduling_url
        }
      });
      
      const isValidToken = eventList?.some(event => event.calendly_url == calendlyUrl) 
      const isValidURL = eventList?.some(event => event.calendly_url == calendlyUrl && event.active == true) 
      return {
        eventList,
        isValidToken,
        isValidURL
      }
   
    }else{
    return {
      eventList : [],
      isValidToken : false,
      isValidURL : false
    }
  }
  } catch (error) {
    console.log(error);
  }
}