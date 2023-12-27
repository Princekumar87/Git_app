const express = require('express');
const path = require('path');
const { Octokit } = require('@octokit/rest');
const mongoose = require('mongoose');

const app = express();

// Serve the static HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// MongoDB setup
mongoose.connect('mongodb://localhost:27017/githubAppDB', { useNewUrlParser: true, useUnifiedTopology: true });
const Repository = mongoose.model('Repository', { name: String, url: String });

// GitHub API setup
const octokit = new Octokit({
  auth: 'YOUR_APP_PRIVATE_KEY' // Replace with your GitHub App's private key
});

// Route to search repositories
app.get('/search-repos/:query', async (req, res) => {
  const { query } = req.params;

  try {
    const repos = await octokit.search.repos({ q: query });
    // Store fetched repositories in MongoDB
    await Repository.insertMany(repos.data.items);
    res.json(repos.data.items);
  } catch (error) {
    res.status(500).json({ error: 'Error searching repositories' });
  }
});

// Route to get stored repositories from MongoDB
app.get('/stored-repos', async (req, res) => {
  try {
    const storedRepos = await Repository.find();
    res.json(storedRepos);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stored repositories' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
