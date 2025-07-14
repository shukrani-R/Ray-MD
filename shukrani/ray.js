let cm = [];

function ray(obj, fonctions) {
    if (!obj.nomCom) throw new Error("Command must have a 'nomCom'");

    if (cm.find(c => c.nomCom === obj.nomCom)) {
        throw new Error(`Command "${obj.nomCom}" already exists`);
    }

    let infoComs = obj;

    infoComs.categorie = obj.categorie || "General";
    infoComs.reaction = obj.reaction || "🤦";
    infoComs.aliases = Array.isArray(obj.aliases) ? obj.aliases : [];

    infoComs.fonction = fonctions;
    cm.push(infoComs);

    return infoComs;
}

module.exports = { ray, Module: ray, cm };
