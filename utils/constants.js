const techAttackAngle = [
    "12:00", "12:30",
    "1:00", "1:30",
    "2:00", "2:30",
    "3:00", "3:30",
    "4:00", "4:30",
    "5:00", "5:30",
    "6:00", "6:30",
    "7:00", "7:30",
    "8:00", "8:30",
    "9:00", "9:30",
    "10:00", "10:30",
    "11:00", "11:30"
];

const beltColor = [
    "Yellow",
    "Orange",
    "Purple",
    "Blue",
    "Green",
    "Brown",
    "Red",
    "Red/Black",
    "Black"
];

const beltGroup = {
    beginner: ["White", "Yellow", "Orange"],
    intermediate: ["Purple", "Blue", "Green"],
    advanced: ["Brown", "Red", "Red/Black"],
    expert: ["Black"]
};

const techGroup = [
    "Punch",
    "Kick",
    "Strike Combo",
    "Grab",
    "Hold & Hug",
    "Tackle",
    "Choke",
    "Lock",
    "Push",
    "Multiple Attacker",
    "Stick Attack",
    "Gun Attack",
    "Knife Attack"
];

module.exports = { 
    techAttackAngle,
    beltColor,
    beltGroup,
    techGroup
};