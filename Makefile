NAME        = transcendence
COMPOSE     = ./docker-compose.yml
HIDE        = /dev/null 2>&1

all: clean up

up:
	@docker compose -p $(NAME) -f $(COMPOSE) up -d --build || (echo " $(BUILD_INTERRUPTED)" && exit 1)
	@echo " $(CONTAINERS_STARTED)"

down:
	@docker compose -p $(NAME) down
	@echo " $(CONTAINERS_STOPPED)"

show:
	@docker image ls -a && echo "\n" && docker ps && echo "\n"

clean:
	@docker compose -f $(COMPOSE) down --volumes --remove-orphans
	# @docker compose -f $(COMPOSE) down -v
	# @docker system prune -f > $(HIDE) 2>&1 || true
	@echo " $(CLEANED)"

# fclean: clean
fclean:
	@docker compose -f $(COMPOSE) down --rmi all --volumes --remove-orphans
	@docker system prune --all --force --volumes
	# @docker stop $$(docker ps -qa) > $(HIDE) 2>&1 || true
	# @docker rm $$(docker ps -qa) > $(HIDE) 2>&1 || true
	# @docker rmi -f $$(docker images -qa) > $(HIDE) 2>&1 || true
	# @docker volume rm $$(docker volume ls -q) > $(HIDE) 2>&1 || true
	# @docker network rm $$(docker network ls -q) > $(HIDE) 2>&1 || true
	@echo " $(FULLY_CLEANED)"

# remove: down fclean
	# @docker stop $$(docker ps -qa) > $(HIDE) 2>&1 || true
	# 	@echo "\nPreparing to start with a clean state..."
	# @docker rm $$(docker ps -qa) > $(HIDE) 2>&1 || true
	# @docker rmi -f $$(docker images -qa) > $(HIDE) 2>&1 || true
	# @docker volume rm $$(docker volume ls -q) > $(HIDE) 2>&1 || true
	# @docker network rm $$(docker network ls -q) > $(HIDE) 2>&1 || true
	# @echo " $(REMOVED)"

status:
	@clear
	@echo "\n--- CONTAINERS ---\n"; docker ps -a
	@echo "\n--- IMAGES ---\n"; docker image ls
	@echo "\n--- VOLUMES ---\n"; docker volume ls
	@echo "\n--- NETWORKS ---\n"; docker network ls
	@echo ""

logs:
	@echo "\n--- FRONTEND SERVICE LOGS ---\n"
	@docker compose logs $(NAME)-frontend
	@echo "\n--- PONG API SERVICE LOGS ---\n"
	@docker compose logs $(NAME)-pong-api
	@echo "\n--- MATCHMAKING SERVICE LOGS ---\n"
	@docker compose logs $(NAME)-matchmaking-1
	@echo "\n--- AI OPPONENT SERVICE LOGS ---\n"
	@docker compose logs $(NAME)-ai-opponent-1
	@echo "\n--- AI MESSAGES SERVICE LOGS ---\n"
	@docker compose logs $(NAME)-ai-messages-1

re: fclean all

BUILD_INTERRUPTED   = $(YELLOW)[WARNING] Docker build interrupted$(RESET)
CONTAINERS_STARTED  = $(GREEN)[SUCCESS] Containers started successfully$(RESET)
CONTAINERS_STOPPED  = $(YELLOW)[INFO] Containers stopped$(RESET)
CLEANED             = $(GREEN)[SUCCESS] Cleaned up containers, images, and volumes$(RESET)
FULLY_CLEANED       = $(GREEN)[SUCCESS] Fully cleaned up all Docker resources$(RESET)
REMOVED             = $(GREEN)[SUCCESS] Removed all Docker resources$(RESET)

RED         = \033[1;31m
GREEN       = \033[1;32m
YELLOW      = \033[1;33m
CYAN        = \033[1;36m
RESET       = \033[0m

.PHONY: all up down clean fclean remove status re
