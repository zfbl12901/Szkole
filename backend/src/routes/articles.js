import express from 'express';
import { getDatabase } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Fonction pour générer un extrait à partir du contenu
function generateExcerpt(content, maxLength = 150) {
  const plainText = content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength) + '...';
}

// GET /api/articles - Récupérer tous les articles (métadonnées seulement)
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const articles = db.prepare(`
      SELECT 
        id,
        title,
        excerpt,
        category,
        tags,
        created_at,
        updated_at
      FROM articles
      ORDER BY updated_at DESC
    `).all();

    // Parser les tags (stockés en JSON)
    const articlesWithParsedTags = articles.map(article => ({
      ...article,
      tags: JSON.parse(article.tags || '[]'),
      createdAt: article.created_at,
      updatedAt: article.updated_at
    }));

    res.json(articlesWithParsedTags);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/articles/:id - Récupérer un article par ID
router.get('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const article = db.prepare(`
      SELECT * FROM articles WHERE id = ?
    `).get(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({
      id: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category || '',
      tags: JSON.parse(article.tags || '[]'),
      createdAt: article.created_at,
      updatedAt: article.updated_at
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// POST /api/articles - Créer un nouvel article
router.post('/', (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const db = getDatabase();
    const id = uuidv4();
    const excerpt = generateExcerpt(content);
    const tagsJson = JSON.stringify(tags || []);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO articles (id, title, content, excerpt, category, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, content, excerpt, category || '', tagsJson, now, now);

    const article = {
      id,
      title,
      content,
      excerpt,
      category: category || '',
      tags: tags || [],
      createdAt: now,
      updatedAt: now
    };

    res.status(201).json(article);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// PUT /api/articles/:id - Mettre à jour un article
router.put('/:id', (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const db = getDatabase();
    const excerpt = generateExcerpt(content);
    const tagsJson = JSON.stringify(tags || []);
    const now = new Date().toISOString();

    const result = db.prepare(`
      UPDATE articles
      SET title = ?, content = ?, excerpt = ?, category = ?, tags = ?, updated_at = ?
      WHERE id = ?
    `).run(title, content, excerpt, category || '', tagsJson, now, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const article = {
      id: req.params.id,
      title,
      content,
      excerpt,
      category: category || '',
      tags: tags || [],
      updatedAt: now
    };

    res.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// DELETE /api/articles/:id - Supprimer un article
router.delete('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

export default router;

