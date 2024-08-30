export const searchSpecialCase = (searchWord, wordToFindFrom) => {

  const normalizedSearchWordTofind = normalizeCase(searchWord)
  const normalizedName = normalizeCase(wordToFindFrom)
  
  if(normalizedName == normalizedSearchWordTofind){
    return true
  }

  if(searchWord){
    return searchWord?.split(' ')?.length > 0  && searchWord.split(' ').filter(e=>e !== '').some(wordToFind => {
      const normalizedWordToFind = normalizeCase(wordToFind)
  
      return normalizedName?.includes(normalizedWordToFind)
    })
  }
  return false
}


function normalizeCase(str) {
  if (str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim();
  }
}

export const sortSerchedMembers = (members,searchkeyword, type = "USERS") => {
    
    if(members?.length > 0 && searchkeyword){
      const wordtoSearch = normalizeCase(searchkeyword)

      switch (type) {
        case 'USERS':

          const searched_user = members?.filter(user => normalizeCase(user.name) == wordtoSearch)
          if(searched_user?.length > 0){
            members = members?.filter(user=> normalizeCase(user.name) !== wordtoSearch)
            members = [...searched_user, ...members]
          }

          break;
        case 'TESTIMONIALS':
          const searched_testimonial = members?.filter(user => normalizeCase(user.author) == wordtoSearch)
          if(searched_testimonial?.length > 0){
            const found_users = [...searched_testimonial, ...members]
            members =  found_users
          }

        break;  
        case 'TUTORS':
          const searched_tutors = members.filter( user => normalizeCase(user.name) == wordtoSearch)
          if(searched_tutors?.length > 0){
            members = [...searched_tutors]
          }
          break;
        case 'LESSONS':
          const searched_lesson_users  =  members.map(user=>{
            if((normalizeCase(user.tutor_name) == wordtoSearch) || (normalizeCase(user.student_name) == wordtoSearch)){
              return user
            }
          })?.filter(user=> user !== undefined)

          if(searched_lesson_users?.length > 0){
            members =  members.filter( user =>{
              if((normalizeCase(user.tutor_name) !== wordtoSearch) || (normalizeCase(user.student_name) !== wordtoSearch)){
                return user
              }
            })
  
            members = [...searched_lesson_users, ...members]
          }
          break;
        default:
          return members
      }

      return members
    }
    return members
}
 
  