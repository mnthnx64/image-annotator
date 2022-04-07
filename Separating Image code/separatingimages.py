# import shutil
# import os

# os.chdir('C:\Users\hkolte\Documents\Sem 2\Perception\datasets\Code\test subject\MVI_39051')
# dst_dir = "C:\Users\hkolte\Documents\Sem 2\Perception\datasets\Code\test subject\Dest"
# for f in os.listdir():
#     shutil.copy(f, dst_dir)

import glob
import shutil
import os
import re

src_dir = ".\\xyz"
dst_dir = ".\Dest"
list = glob.iglob(os.path.join(src_dir,"*","*.jpg"))
pattern = re.compile(r"[a-zA-Z]+(\d\d\d\d\d)+")
count = 0

for jpgfile in list:
    if int(re.search(pattern, jpgfile).group(1))%25 == 0:
        try:    
            print(re.search(pattern, jpgfile).group(1))
            shutil.copy(jpgfile, dst_dir)
        except FileExistsError:
            os.rename(int(re.search(pattern, jpgfile).group(1)),'' + str(++count))
            shutil.copy('' + str(count), dst_dir)