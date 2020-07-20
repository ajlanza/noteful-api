const FoldersService = {
  getAllFolders(knex) {
    return knex
      .select('*')
      .from('noteful_folders')
  },
  getById(knex, id) {
    return knex
      .from('noteful_folders')
      .select('*')
      .where('id', id)
      .first()
  },
  insertFolder(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into('noteful_folders')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
}

module.exports = FoldersService;