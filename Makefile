.PHONY: serve-webui serve-api serve-all

serve-webui:
	npx nx serve webui

serve-api:
	npx nx serve api

serve-all:
	npx nx run-many -t serve -p webui,@org/api --parallel=2 --outputStyle=stream
