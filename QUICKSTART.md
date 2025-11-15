# Quickstart opérations (VPS)

Récapitulatif des commandes quotidiennes après installation avec `install.sh`.

## Mises à jour

```bash
cd /home/ubuntu/immometrics
./deploy.sh
```

Le script sauvegarde la base, met à jour le dépôt, reconstruit backend/frontend, applique les migrations et vérifie les healthchecks.

## Sauvegardes

```bash
cd /home/ubuntu/immometrics
./db-manage.sh backup      # crée une sauvegarde
./db-manage.sh list        # liste les sauvegardes
./db-manage.sh restore     # restaure (demande confirmation)
```

## Services

```bash
sudo systemctl status immometrics-backend
sudo systemctl status immometrics-frontend
sudo journalctl -u immometrics-backend -f    # logs temps réel
sudo journalctl -u immometrics-frontend -f
```

## Tests rapides

```bash
curl http://localhost:5010/api/health   # API Flask
curl http://localhost:3001              # Frontend Vite preview
```

## Cron (sauvegarde quotidienne)

```
0 2 * * * /home/ubuntu/immometrics/db-manage.sh backup
```

## Emplacements clés

| Ressource | Chemin |
| --- | --- |
| Code & build | `/home/ubuntu/immometrics` |
| Base SQLite | `/home/ubuntu/immometrics/backend/data/sci_analyzer.db` |
| Exports Excel | `/home/ubuntu/immometrics/backend/reports/` |
| Logs backend/frontend | `/home/ubuntu/immometrics/backend/logs/` |
| Sauvegardes DB | `/home/ubuntu/immometrics/backups/` |
