using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Erazer.API.ViewModels;
using Microsoft.AspNetCore.Authorization;

namespace Erazer.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class ResultsController : Controller
    {
        // GET api/results
        [HttpGet]
        public IEnumerable<ResultViewModel> Get()
        {
            return new List<ResultViewModel>()
            {
                new ResultViewModel
                {
                    Id = "AAAA",
                    Subject = "IOT",
                    Score = "20/20",
                    Remarks = "Good job!",
                    Credits = 3,
                    Added = DateTime.Now
                },
                new ResultViewModel
                {
                    Id = "BBBB",
                    Subject = "Datanetworks",
                    Score = "20/20",
                    Remarks = "Good job!",
                    Credits = 6,
                    Added = DateTime.Now
                }
            };
        }
    }
}
