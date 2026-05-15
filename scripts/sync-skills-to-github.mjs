#!/usr/bin/env node

/**
 * Skills GitHub Sync Script
 * 
 * Überwacht /home/ubuntu/skills/ auf Änderungen und synchronisiert zu GitHub
 * Wird automatisch nach jeder Skill-Änderung aufgerufen
 * 
 * Verwendung: node scripts/sync-skills-to-github.mjs
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const skillsSource = '/home/ubuntu/skills';
const skillsDest = path.join(projectRoot, 'skills');

try {
  console.log('🔄 Starte Skills Synchronisation...');
  
  // Überprüfe ob Skills Source existiert
  if (!fs.existsSync(skillsSource)) {
    console.error('❌ Skills Source nicht gefunden:', skillsSource);
    process.exit(1);
  }

  // Kopiere alle Skills
  console.log('📋 Kopiere Skills von', skillsSource);
  execSync(`cp -r ${skillsSource}/* ${skillsDest}/`, { stdio: 'inherit' });

  // Überprüfe ob es Änderungen gibt
  const status = execSync('git status --porcelain', { 
    cwd: projectRoot,
    encoding: 'utf-8' 
  });
  
  if (status.trim() === '') {
    console.log('✅ Keine Skill-Änderungen zu synchronisieren');
    process.exit(0);
  }

  // Zeige Änderungen
  console.log('\n📝 Skill-Änderungen:');
  console.log(status);

  // Füge alle Änderungen hinzu
  console.log('\n📝 Staging Skill-Änderungen...');
  execSync('git add skills/', { 
    cwd: projectRoot,
    stdio: 'inherit' 
  });

  // Erstelle Commit
  const timestamp = new Date().toISOString();
  const commitMessage = `chore(skills): Automatische Synchronisation aller Skills [${timestamp}]`;
  
  console.log(`💾 Erstelle Commit: "${commitMessage}"`);
  execSync(`git commit -m "${commitMessage}"`, { 
    cwd: projectRoot,
    stdio: 'inherit' 
  });

  // Pushe zu GitHub
  console.log('🚀 Pushe Skills zu GitHub...');
  execSync('git -c credential.helper=\'!echo "username=thomas-kiich"; echo "password=${GITHUB_TOKEN}\"\' push github main', { 
    cwd: projectRoot,
    stdio: 'inherit',
    shell: '/bin/bash'
  });

  console.log('✅ Skills Synchronisation erfolgreich!');
  
} catch (error) {
  console.error('❌ Fehler bei Skills Synchronisation:');
  console.error(error.message);
  process.exit(1);
}
