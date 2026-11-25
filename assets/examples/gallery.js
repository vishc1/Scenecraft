/* Gallery: every world in the library, with placeholder text. Build it to see what each one does:
     scripts/build.sh out/gallery.html "World gallery" assets/examples/gallery.js
   Each entry is the whole pattern for using a world: spread WORLDS.name(options) first, then your text. */
const show=(world,title,n,opts,extra)=>SC.push(Object.assign({},WORLDS[world](opts||{}),{
  id:world, title, kind:[0,2,1,3,4][SC.length%5],
  beats:Array.from({length:n},(_,i)=>({dur:2.6,note:'Step '+(i+1)+' of '+n+' in the '+world+' world.'})),
  layers:[{b:[0,n-1],z:'tl',h:'<p class="eb">WORLDS.'+world+'</p><h2>'+title+'</h2>'}]},extra||{}));
const big=(a,b,c)=>'<h3>'+a+'</h3><p class="lab hi" style="margin:6px 0 8px">'+b+'</p>'+(c?'<p class="lab" style="letter-spacing:0">'+c+'</p>':'');
const fig=(a,b,c)=>'<p class="fig">'+a+'</p><p class="lab hi" style="letter-spacing:3px;margin:2px 0 6px">'+b+'</p><p class="body">'+c+'</p>';

show('sea','A place to open',2);
show('pages','A quotation',3);
show('planet','A whole world changing',4);
show('monoliths','Six things in order',3,{labels:['One','Two','Three','Four','Five','Six'].map((s,i)=>big(String(i+1),s,'what it is'))});
show('stairs','Steps that keep going',3,{labels:['Start',null,'Step 5','Step 8',null,'Now','Soon','Later','Far ahead']});
show('blocks','Three things multiplying',4,{labels:[fig('5×','FIRST','what multiplies'),fig('3×','SECOND','what multiplies'),fig('<em>280×</em>','THIRD','what multiplies')]});
show('tunnel','One statement',2,{},{light:true});
show('gyro','A loop that speeds up',4,{labels:['Plan','Build','Measure','Learn']});
show('city','One becomes a million',4,{labels:['1','100','10,000','1,000,000']});
show('scaleTower','A scale with no top',3,{labels:['Small','Medium','Large','Largest we know','Everything so far','?']});
show('ribbons','Three possible curves',3,{labels:['Steady','Faster','Runaway']});
show('pier','A long time, compressed',3,{labels:['First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','start','end']});
show('hangingSun','Something hanging by a thread',4);
show('sea','A place to close',2,{sunrise:true},{id:'sunrise'});
