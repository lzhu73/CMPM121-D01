import { getScrap, modifyScrap } from "./main.ts";

interface RobotType {
  singularName: string;
  pluralName: string;
  harvestAmount: number;
  costFunction: (numRobots: number) => number;
}

interface RobotData {
  numRobots: number;
  harvestMultiplier: number;
  countElement: HTMLElement;
  harvestElement: HTMLElement;
  costElement: HTMLElement;
  buyButton: HTMLButtonElement;
}

// Data Driven Config
const robotTypes: RobotType[] = [
  {
    singularName: "Scrap Robot",
    pluralName: "Scrap Robots",
    harvestAmount: 1,
    costFunction: getScrapRobotCost,
  },
  {
    singularName: "Steel Robot",
    pluralName: "Steel Robots",
    harvestAmount: 5,
    costFunction: getSteelRobotCost,
  },
  {
    singularName: "Titanium Robot",
    pluralName: "Titanium Robots",
    harvestAmount: 20,
    costFunction: getTitaniumRobotCost,
  },
  {
    singularName: "Platinum Robot",
    pluralName: "Platinum Robots",
    harvestAmount: 100,
    costFunction: getPlatinumRobotCost,
  },
];

function getScrapRobotCost(numRobots: number): number {
  return Math.ceil(10 * 1.15 ** numRobots);
}

function getSteelRobotCost(numRobots: number): number {
  return Math.ceil(40 * 1.17 ** numRobots);
}

function getTitaniumRobotCost(numRobots: number): number {
  return Math.ceil(150 * 1.20 ** numRobots);
}

function getPlatinumRobotCost(numRobots: number): number {
  return Math.ceil(500 * 1.30 ** numRobots);
}

// Dynamic Variables
const robotData: RobotData[] = [];
let robotTimer: number = 0;
let autoScrap: number = 0; //for console

// HTML Variables
const robotColumn = document.getElementById("robotColumn")!;

export function setupRobots() {
  for (const robotType of robotTypes) {
    const divElement = document.createElement("div");
    divElement.className = "storeContainer";

    const countElement = document.createElement("h2");
    divElement.append(countElement);

    const harvestElement = document.createElement("p");
    divElement.append(harvestElement);

    const costElement = document.createElement("p");
    divElement.append(costElement);

    const buyButton = document.createElement("button");
    buyButton.textContent = "Buy " + robotType.singularName;
    divElement.append(buyButton);

    const finalRobotData: RobotData = {
      numRobots: 0,
      harvestMultiplier: 1,
      countElement: countElement,
      harvestElement: harvestElement,
      costElement: costElement,
      buyButton: buyButton,
    };
    robotData.push(finalRobotData);
    buyButton.addEventListener(
      "click",
      () => buyRobot(robotType, finalRobotData),
    );

    robotColumn.append(divElement);
    updateRobotElements(robotType, finalRobotData);
  }
}

export function updateRobots(deltaTime: number): number {
  robotTimer += deltaTime;
  let scrapHarvest: number = 0;

  while (robotTimer >= 5) {
    for (const [index, robotType] of robotTypes.entries()) {
      const harvest: number = getRobotHarvest(
        robotType,
        robotData[index],
      );
      scrapHarvest += harvest;

      autoScrap += harvest;
      console.log("Total auto harvested scrap:", autoScrap);
    }
    robotTimer -= 5;
  }

  return scrapHarvest;
}

export function getRobotPluralName(robotIndex: number): string {
  return robotTypes[robotIndex].pluralName;
}

export function multiplyRobotHarvestMultiplier(
  robotIndex: number,
  multiplier: number,
) {
  robotData[robotIndex].harvestMultiplier *= multiplier;
  updateRobotElements(robotTypes[robotIndex], robotData[robotIndex]);
}

export function updateAllRobotElements() {
  for (const [index, robotType] of robotTypes.entries()) {
    updateRobotElements(robotType, robotData[index]);
  }
}

function updateRobotElements(robotType: RobotType, robotData: RobotData) {
  robotData.countElement.textContent = robotType.pluralName + ": " +
    robotData.numRobots;

  const robotHarvest: number = getRobotHarvest(robotType, robotData);
  robotData.harvestElement.textContent = "Harvesting " +
    robotHarvest.toString() + " scrap every 5 seconds";

  const robotCost: number = robotType.costFunction(robotData.numRobots);
  robotData.costElement.textContent = "Cost: " + robotCost.toString() +
    " Scrap";

  robotData.buyButton.disabled = getScrap() < robotCost;
}

function buyRobot(robotType: RobotType, robotData: RobotData) {
  const robotCost: number = robotType.costFunction(robotData.numRobots);

  if (getScrap() >= robotCost) {
    modifyScrap(-1 * robotCost);
    robotData.numRobots++;

    updateRobotElements(robotType, robotData);
  }
}

function getRobotHarvest(robotType: RobotType, robotData: RobotData): number {
  return robotType.harvestAmount * robotData.harvestMultiplier *
    robotData.numRobots;
}
