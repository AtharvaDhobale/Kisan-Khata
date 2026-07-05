@echo off
git remote remove origin 2>nul
git remote add origin https://github.com/AtharvaDhobale/Kisan-Khata.git
git add .
git commit -m "feat: rename to Kisan Khata (kisan-khata) — Hindi farm management app"
git branch -M main
git push -u origin main
echo PUSH_DONE
