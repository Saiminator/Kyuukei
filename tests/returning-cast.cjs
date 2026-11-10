// Render the real Volume 2 template with synthetic summaries, without publishing
// profiles on Volume 1 or adding unannounced content to the production site.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
module.exports=function returningCast(){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'kyuukei-cast-test-'));
  try{
    const source=path.join(tmp,'source'),output=path.join(tmp,'public');
    fs.mkdirSync(source);
    for(const name of ['_config.yml','_layouts','_includes','_data'])fs.cpSync(path.join(root,name),path.join(source,name),{recursive:true});
    fs.mkdirSync(path.join(source,'_volumes'));
    const volume={number:2,slug:'volume-2',title:'Volume 2',status:'Upcoming',published:true,featured_characters:[{character:'kyuu',known_through:1,description:'Synthetic returning-character summary.\n\nA second test paragraph.\n\nA final **Markdown** test paragraph.'}]};
    fs.writeFileSync(path.join(source,'_volumes/volume-2.md'),'---\n'+JSON.stringify(volume)+'\n---\n');
    execFileSync('bundle',['_2.6.9_','exec','jekyll','build','--destination',output,'--strict_front_matter'],{cwd:source,env:{...process.env,BUNDLE_GEMFILE:path.join(root,'Gemfile'),JEKYLL_ENV:'production'},stdio:'pipe',encoding:'utf8'});
    return fs.readFileSync(path.join(output,'volumes/volume-2/index.html'),'utf8');
  }finally{fs.rmSync(tmp,{recursive:true,force:true})}
};
