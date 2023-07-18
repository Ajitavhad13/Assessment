export class SocialNetworkQueries {
  constructor({ fetchCurrentUser }) {
    this.emptyResult = []
    this.lastResult = this.emptyResult
    this.metaData = null
    this.fetchCurrentUser = fetchCurrentUser
  }

  async fetchLatestData() {
    try {
      this.metaData = await this.fetchCurrentUser()
      // cache
      this.lastResult = this.metaData
    } catch (e) {
      throw e
    }
  }

  validUser() {
    return this.metaData?.friends != null
  }

  validFriend(friend) {
    if (!friend?.likes || !friend?.likes.length ) {
      return false
    }
    return true
  }

  uniqBooks(likes) {
    if(!likes) return []
    return likes.reduce((uniqueBooks, book) => {
    if (!uniqueBooks.includes(book)) {
      uniqueBooks.push(book)
    }
    return uniqueBooks
  }, [])
}

  // get percentage of positive outcome
  scoreBooks() {
    const data = this.metaData
    const likedBooks = data.likes
    const validFriends = data?.friends.filter((f) => this.validFriend(f)) ?? []
    const friendCount = validFriends.length
    const bookCount = data.friends.reduce((total, friend, i) => {
    const uniqBooks = this.uniqBooks(friend.likes)
    
    const validBooks = uniqBooks.filter((book) => !likedBooks.includes(book))
    validBooks.forEach((book) => {
        total[book] = (total?.[book] ?? 0) + 1
    })
    return total
    }, {})
    const booksRatedArray = Object.entries(bookCount).map(([key, val]) => {
      return { name: key, rate: (val / friendCount) * 100 }
    })

    const booksSorted = booksRatedArray.sort((a, b) => {
        if (a.rate !== b.rate) {
          return a.rate > b.rate ? -1 : 1
        } else {
          return a.name < b.name ? -1 : 1
        }
      })
    return booksSorted
  }


  async findPotentialLikes(minimalScore) {
    try {
      await this.fetchLatestData()
    } catch (e) {
     this.metaData = this.lastResult
    }
    if (!this.validUser()) {
      return this.emptyResult
    }
    const booksSorted = this.scoreBooks()
    const filteredBooks = booksSorted.filter(
      (book) => book.rate > (minimalScore * 100)
    )
    console.log(booksSorted, (minimalScore * 100),minimalScore)
    const result =filteredBooks.map((book) => book.name)

    return result
  }
}
