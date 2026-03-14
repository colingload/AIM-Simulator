export const _badWords = [
  // sexual
  "fuck","shit","cock","dick","pussy","cunt","tits","boobs","horny","sexy","nude","naked",
  "blowjob","handjob","masturbat","orgasm","penis","vagina","boner","erection","cum","jizz",
  "slut","whore","hoe","thot","onlyfans","porn","hentai","xxx","nsfw","dildo","vibrator",
  "anal","oral sex","69","titties","boobies","nudes","sext","sexting","bang me","wanna fuck",
  // slurs & hate
  "nigger","nigga","faggot","fag","retard","retarded","tranny","kike","spic","chink","gook",
  "wetback","beaner","cracker","honky","dyke","cripple",
  // violent/threatening
  "kill yourself","kys","kill you","rape","molest","shoot you","stab you","bomb","terrorist",
  // harassment
  "die","neck yourself","go die","end yourself","jump off"
];
const _badPatterns = _badWords.map(w=>new RegExp("\\b"+w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b","i"));

export function checkMessage(text:string) {
  const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g,"");
  // Check word patterns
  for(const pat of _badPatterns) {
    if(pat.test(text)||pat.test(lower)) return true;
  }
  // Check leetspeak common swaps
  const decoded = lower.replace(/0/g,"o").replace(/1/g,"i").replace(/3/g,"e").replace(/4/g,"a").replace(/5/g,"s").replace(/\$/g,"s").replace(/@/g,"a");
  for(const pat of _badPatterns) {
    if(pat.test(decoded)) return true;
  }
  return false;
}
