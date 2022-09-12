const App = () => {
  /**
   * Mount
   */
     useEffect(() => {
      fetchData()
    }, [])

    /**
     * Whenever $documents is updated, store files in DB.
     */
    useEffect(() => {
      if (documents.length) {
        localStorage.setItem('documentFiles', JSON.stringify(documents))
      }
    }, [documents])

    /**
     * Get stored document files on mount
     */
    const fetchData = () => {
      const storedDocumentFiles = localStorage.getItem('documentFiles')

      if (storedDocumentFiles) {
        setDocuments(JSON.parse(storedDocumentFiles))
       }
    }
}