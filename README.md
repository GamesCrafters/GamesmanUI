GamesmanUI
===
Spring 2015 we try again to the web UI to end them all.

Data
---
Comes from GamesmanGames server, which runs files in GamesmanGames/bin with the --interact flag basically.
```
cd GamesmanGames
python src/server.py
```
Connect on port 8081.


TODO:

Figure out how server works and what it returns

Mapping:
getStart => start_response
getEnd?board="*board*" => end_response
getNextMoveValues?board="*board*" => next_move_values_response
getMoveValue?board="*board*" => move_value_response

Figure out how to draw