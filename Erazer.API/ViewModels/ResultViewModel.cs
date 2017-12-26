using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Erazer.API.ViewModels
{
    public class ResultViewModel
    {
        public string Id { get; set; }
        public string Subject { get; set; }
        public string Score { get; set; }
        public string Remarks { get; set; }
        public byte Credits { get; set; }
        public DateTime Added { get; set; }
    }
}
