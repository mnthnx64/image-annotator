
import glob
import shutil
import os
import re

src_dir = ".\\Insight-MVT_Annotation_Test"
os.mkdir(".\Sorted_Images")
dst_dir = ".\Sorted_Images"
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
