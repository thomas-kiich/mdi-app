#!/usr/bin/env node

/**
 * GitHub Sync Script
 * 
 * Synchronisiert den aktuellen Git-Status zu GitHub
 * Wird nach jedem Manus Checkpoint aufgerufen
 * 
 * Verwendung: node scripts/sync-to-github.mjs "Commit Message"
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const commitMessage = args[0] || `Sync: ${new Date().toISOString()}`;

try {
  console.log('🔄 Starte GitHub Synchronisation...');
  
  // Überprüfe ob GitHub Remote existiert
  const remotes = execSync('git remote -v', { encoding: 'utf-8' });
  if (!remotes.includes('github')) {
    console.error('❌ GitHub Remote nicht konfiguriert!');
    process.exit(1);
  }

  // Überprüfe ob es Änderungen gibt
  const status = execSync('git status --porcelain', { encoding: 'utf-8' });
  
  if (status.trim() === '') {
    console.log('✅ Keine Änderungen zu synchronisieren');
    process.exit(0);
  }

  // Füge alle Änderungen hinzu
  console.log('📝 Staging Änderungen...');
  execSync('git add -A', { stdio: 'inherit' });

  // Erstelle Commit mit automatischer Message
  console.log(`💾 Erstelle Commit: "${commitMessage}"`);
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

  // Pushe zu GitHub
  console.log('🚀 Pushe zu GitHub...');
  execSync('git push github main', { stdio: 'inherit' });

  console.log('✅ GitHub Synchronisation erfolgreich!');
  
} catch (error) {
  console.error('❌ Fehler bei GitHub Synchronisation:');
  console.error(error.message);
  process.exit(1);
}
