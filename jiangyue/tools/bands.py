import sys, wave, numpy as np
w=wave.open(sys.argv[1]); sr=w.getframerate(); d=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).reshape(-1,2).astype(np.float64)/32768
mono=d.mean(axis=1)
secs=[(0,12),(12,38),(38,66),(66,94),(94,119),(119,142),(142,150)]
bands=[(30,120),(120,300),(300,800),(800,2000),(2000,5000),(5000,16000)]
print('sec      '+'  '.join('%5d-%-5d'%b for b in bands))
for a,b in secs:
    x=mono[a*sr:b*sr]; X=np.abs(np.fft.rfft(x*np.hanning(len(x))))**2; f=np.fft.rfftfreq(len(x),1/sr); tot=X.sum()
    print('%3d-%-3d '%(a,b)+'  '.join('%10.1f'%(10*np.log10(X[(f>=lo)&(f<hi)].sum()/tot+1e-12)) for lo,hi in bands))
